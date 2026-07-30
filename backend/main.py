from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from utils import extract_text
from rag.pipeline import process_document, query_document
from sql_agent import load_database, get_schema, get_table_preview, natural_language_to_sql, run_query
from pydantic import BaseModel
import shutil
import os

os.environ["ANONYMIZED_TELEMETRY"] = "False"

load_dotenv()

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
SQL_FOLDER = os.path.join(BASE_DIR, "sql_uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SQL_FOLDER, exist_ok=True)

ALLOWED_RAG_EXTENSIONS = {"pdf", "docx", "txt", "csv", "xlsx", "json", "pptx", "md"}
ALLOWED_SQL_EXTENSIONS = {"csv", "xlsx", "db", "sqlite", "sql"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_connections = {}

class QueryRequest(BaseModel):
    question: str
    session_id: str

class SQLQueryRequest(BaseModel):
    question: str
    session_id: str

@app.get("/")
def home():
    return {"message": "RAG App backend is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_RAG_EXTENSIONS:
        return {"error": f"File type .{ext} not supported. Allowed: {', '.join(ALLOWED_RAG_EXTENSIONS)}"}

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        return {"error": "File too large. Maximum size is 10MB."}

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    try:
        text = extract_text(file_path, file.filename)
        if not text.strip():
            return {"error": "Could not extract text from this file. It may be a scanned image."}

        session_id = file.filename.replace(".", "_")
        chunks_count = process_document(text, session_id)

        return {
            "filename": file.filename,
            "session_id": session_id,
            "chunks": chunks_count
        }
    except Exception as e:
        return {"error": f"Failed to process file: {str(e)}"}

@app.post("/query")
async def query(request: QueryRequest):
    try:
        answer = query_document(request.question, request.session_id)
        return {"answer": answer}
    except Exception as e:
        return {"error": f"Query failed: {str(e)}"}

@app.post("/sql/upload")
async def sql_upload(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_SQL_EXTENSIONS:
        return {"error": f"File type .{ext} not supported. Allowed: {', '.join(ALLOWED_SQL_EXTENSIONS)}"}

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        return {"error": "File too large. Maximum size is 10MB."}

    file_path = os.path.join(SQL_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    try:
        conn = load_database(file_path, file.filename)
        session_id = file.filename.replace(".", "_")
        db_connections[session_id] = conn

        schema = get_schema(conn)
        first_table = list(schema.keys())[0]
        preview = get_table_preview(conn, first_table)

        return {
            "session_id": session_id,
            "schema": schema,
            "preview": preview,
            "first_table": first_table
        }
    except Exception as e:
        return {"error": f"Failed to load database: {str(e)}"}

@app.post("/sql/query")
async def sql_query(request: SQLQueryRequest):
    try:
        conn = db_connections.get(request.session_id)
        if not conn:
            return {"error": "Session not found. Please re-upload your file."}

        schema = get_schema(conn)
        sql = natural_language_to_sql(request.question, schema)
        result = run_query(conn, sql)

        return {"sql": sql, "result": result}
    except Exception as e:
        return {"error": f"Query failed: {str(e)}"}