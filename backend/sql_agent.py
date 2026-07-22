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

    return conn

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

def natural_language_to_sql(question: str, schema: dict):
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=os.getenv("GROQ_API_KEY")
    )

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