# DocQuery AI 📄🗄️

A full-stack AI-powered document and database query application. Upload any file and interact with it using natural language.

## Features

- **Mode 1 — Document Chat (RAG)**: Upload PDFs, Word docs, text files, CSVs, Excel, JSON, PPTX and chat with them using a RAG pipeline
- **Mode 2 — SQL Query (Text-to-SQL)**: Upload CSV or database files, visualize data in a table, and query it using plain English

## Tech Stack

**Frontend**
- React.js

**Backend**
- FastAPI (Python)
- LangChain
- ChromaDB (vector store)
- SentenceTransformers (embeddings)
- Groq API (LLM — Llama 3.1)
- SQLite (database engine)

## Project Structure
ragapp/
├── backend/
│ ├── main.py ← FastAPI server
│ ├── utils.py ← File text extraction
│ ├── sql_agent.py ← Text-to-SQL logic
│ ├── requirements.txt
│ └── rag/
│ ├── chunker.py ← Text splitting
│ ├── embedder.py ← Embeddings
│ ├── vectorstore.py ← ChromaDB
│ ├── generator.py ← Groq LLM
│ └── pipeline.py ← RAG pipeline
│
└── frontend/
└── src/
└── App.js ← React frontend

## How It Works

1)RAG Pipeline (Document Chat):
Upload file → Extract text → Chunk → Embed → Store in ChromaDB
Ask question → Embed question → Retrieve top 3 chunks → Send to Groq → Answer

2)Text-to-SQL (SQL Query):
Upload CSV/DB → Load into SQLite → Extract schema
Ask question → Send schema + question to Groq → Get SQL → Run on SQLite → Return results

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `.env` file in `backend/`:
paste this: 
GROQ_API_KEY=your_groq_api_key_here

Run backend:
```bash
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Supported File Formats

| Mode | Formats |
|------|---------|
| Document Chat | PDF, DOCX, TXT, CSV, XLSX, JSON, PPTX, MD |
| SQL Query | CSV, XLSX, DB, SQLite |

## Deployment

- **Backend**: Render.com
- **Frontend**: Vercel

## Author

Gaurav Thakur
- GitHub: [@GAURAV4478](https://github.com/GAURAV4478)
- LinkedIn: [linkedin.com/in/gauravthakur7](https://linkedin.com/in/gauravthakur7)




