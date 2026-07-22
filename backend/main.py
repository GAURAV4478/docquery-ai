from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from utils import extract_text
from rag.pipeline import process_document, query_document
from sql_agent import load_database, get_schema, get_table_preview, natural_language_to_sql, run_query
from pydantic import BaseModel
import shutil
import os
import sqlite3

load_dotenv()

app = FastAPI()

UPLOAD_FOLDER = "uploads"
SQL_FOLDER = "sql_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SQL_FOLDER, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active DB connections
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

# MODE 2 - RAG
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_text(file_path, file.filename)
    session_id = file.filename.replace(".", "_")
    chunks_count = process_document(text, session_id)

    return {
        "filename": file.filename,
        "session_id": session_id,
        "chunks": chunks_count
    }

@app.post("/query")
async def query(request: QueryRequest):
    answer = query_document(request.question, request.session_id)
    return {"answer": answer}

# MODE 1 - SQL
@app.post("/sql/upload")
async def sql_upload(file: UploadFile = File(...)):
    file_path = os.path.join(SQL_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    conn = load_database(file_path, file.filename)
    session_id = file.filename.replace(".", "_")
    db_connections[session_id] = conn

    schema = get_schema(conn)
    
    # Get preview of first table
    first_table = list(schema.keys())[0]
    preview = get_table_preview(conn, first_table)

    return {
        "session_id": session_id,
        "schema": schema,
        "preview": preview,
        "first_table": first_table
    }

@app.post("/sql/query")
async def sql_query(request: SQLQueryRequest):
    conn = db_connections.get(request.session_id)
    
    if not conn:
        return {"error": "Session not found. Please re-upload your file."}

    schema = get_schema(conn)
    sql = natural_language_to_sql(request.question, schema)
    result = run_query(conn, sql)

    return {
        "sql": sql,
        "result": result
    }