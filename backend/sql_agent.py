import sqlite3
import pandas as pd
import os
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage


def load_database(file_path: str, filename: str):
    ext = filename.split(".")[-1].lower()
    os.makedirs("sql_uploads", exist_ok=True)
    db_path = f"sql_uploads/{filename}.db"
    conn = sqlite3.connect(db_path)

    if ext == "csv":
        df = pd.read_csv(file_path)
        table_name = filename.replace(".csv", "").replace(" ", "_").replace("-", "_")
        df.to_sql(table_name, conn, if_exists="replace", index=False)

    elif ext == "xlsx":
        df = pd.read_excel(file_path)
        table_name = filename.replace(".xlsx", "").replace(" ", "_").replace("-", "_")
        df.to_sql(table_name, conn, if_exists="replace", index=False)

    elif ext in ["db", "sqlite", "sql"]:
        conn.close()
        conn = sqlite3.connect(file_path)
        _sanitize_table_names(conn)

    return conn

def _sanitize_table_names(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]

    for table in tables:
        safe_name = table.replace("-", "_").replace(" ", "_")
        if safe_name != table:
            cursor.execute(f'ALTER TABLE "{table}" RENAME TO "{safe_name}"')

    conn.commit()


def get_schema(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()

    schema = {}
    for (table,) in tables:
        cursor.execute(f'PRAGMA table_info("{table}")')
        columns = cursor.fetchall()
        schema[table] = [{"name": col[1], "type": col[2]} for col in columns]

    return schema


def get_table_preview(conn, table_name: str, limit: int = 5):
    df = pd.read_sql_query(f'SELECT * FROM "{table_name}" LIMIT {limit}', conn)
    return df.to_dict(orient="records")


def _get_llm():
    return ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=os.getenv("GROQ_API_KEY")
    )


def natural_language_to_sql(question: str, schema: dict):
    llm = _get_llm()

    schema_str = ""
    for table, cols in schema.items():
        col_str = ", ".join([f"{c['name']} ({c['type']})" for c in cols])
        schema_str += f'Table: "{table}"\nColumns: {col_str}\n\n'

    messages = [
        SystemMessage(content="""You are a SQL expert. Given a database schema and a question, generate a valid SQLite SQL query.
IMPORTANT: Always wrap table names in double quotes e.g. SELECT * FROM "table-name"
Return ONLY the SQL query, nothing else. No explanation, no markdown, no backticks. Just the raw SQL."""),
        HumanMessage(content=f"""Schema:
{schema_str}

Question: {question}

SQL Query:""")
    ]

    response = llm.invoke(messages)
    return response.content.strip()


def check_sql_confidence(question: str, schema: dict, sql: str):
    llm = _get_llm()

    schema_str = ""
    for table, cols in schema.items():
        col_str = ", ".join([f"{c['name']} ({c['type']})" for c in cols])
        schema_str += f'Table: "{table}"\nColumns: {col_str}\n\n'

    messages = [
        SystemMessage(content="""You are a SQL reviewer. You will be given a schema, a natural language question, and a generated SQL query.
Rate how confident you are (0-100) that this SQL query correctly and completely answers the question.
Consider: does it use the right table/columns, does it miss obvious filters, does it misunderstand the question.

Respond in EXACTLY this format, nothing else:
SCORE: <number>
REASON: <one short sentence>"""),
        HumanMessage(content=f"""Schema:
{schema_str}

Question: {question}

Generated SQL: {sql}""")
    ]

    response = llm.invoke(messages)
    text = response.content.strip()

    score = 70
    reason = "Could not parse confidence response."
    try:
        for line in text.splitlines():
            if line.upper().startswith("SCORE:"):
                score = int("".join(ch for ch in line.split(":", 1)[1] if ch.isdigit() or ch == "-"))
            elif line.upper().startswith("REASON:"):
                reason = line.split(":", 1)[1].strip()
    except Exception:
        pass

    return {"score": score, "reason": reason}


def _uses_full_table_scan(conn, sql: str) -> bool:
    try:
        cursor = conn.cursor()
        cursor.execute(f"EXPLAIN QUERY PLAN {sql}")
        plan_rows = cursor.fetchall()
        plan_text = " ".join(str(row) for row in plan_rows).upper()
        return "SCAN" in plan_text and "SEARCH" not in plan_text
    except Exception:
        return False


def optimize_sql(conn, question: str, schema: dict, sql: str):
    needs_optimization = _uses_full_table_scan(conn, sql)

    if not needs_optimization:
        return {
            "optimized": False,
            "original_sql": sql,
            "final_sql": sql,
            "reason": "Query plan looks fine, no full table scan detected."
        }

    llm = _get_llm()
    schema_str = ""
    for table, cols in schema.items():
        col_str = ", ".join([f"{c['name']} ({c['type']})" for c in cols])
        schema_str += f'Table: "{table}"\nColumns: {col_str}\n\n'

    messages = [
        SystemMessage(content="""You are a SQL performance expert. You will be given a schema, a question, and a SQL query
that is doing a full table scan (slow on large tables). Rewrite the query to be more efficient if possible
(e.g. narrower SELECT, better filtering, avoiding unnecessary subqueries). If there's genuinely no way to
avoid a full scan for this query, return the original query unchanged.

Return ONLY the SQL query, nothing else. No explanation, no markdown, no backticks."""),
        HumanMessage(content=f"""Schema:
{schema_str}

Question: {question}

Current SQL (doing a full table scan):
{sql}

Optimized SQL:""")
    ]

    response = llm.invoke(messages)
    rewritten_sql = response.content.strip()

    return {
        "optimized": rewritten_sql != sql,
        "original_sql": sql,
        "final_sql": rewritten_sql,
        "reason": "Original query scanned the full table; rewritten for better performance."
                  if rewritten_sql != sql else
                  "Query scans the full table, but no safe rewrite was found."
    }


def run_query(conn, sql: str):
    try:
        df = pd.read_sql_query(sql, conn)
        return {
            "success": True,
            "columns": list(df.columns),
            "rows": df.to_dict(orient="records"),
            "count": len(df)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }