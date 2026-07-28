# DocQuery AI 📄🗄️

A full-stack AI-powered document and database query application. Upload any file and interact with it using natural language.

🔗 **Live Demo:** [docquery-ai-omega.vercel.app](https://docquery-ai-omega.vercel.app)

---

## Features

- **Mode 1 — Document Chat (RAG):** Upload PDFs, Word docs, text files, CSVs, Excel, JSON, PPTX and chat with them using a RAG pipeline
- **Mode 2 — SQL Query (Text-to-SQL):** Upload CSV or database files, visualize data in a table, and query it using plain English

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | FastAPI (Python) |
| LLM | Groq API (Llama 3.1-8b) |
| Vector Store | ChromaDB |
| Embeddings | Gemini Embeddings API |
| Text-to-SQL | LangChain + SQLite |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Project Structure

```
ragapp/
├── backend/
│   ├── main.py            ← FastAPI server
│   ├── utils.py           ← File text extraction
│   ├── sql_agent.py       ← Text-to-SQL logic
│   ├── requirements.txt
│   └── rag/
│       ├── chunker.py     ← Text splitting
│       ├── embedder.py    ← Embeddings
│       ├── vectorstore.py ← ChromaDB
│       ├── generator.py   ← Groq LLM
│       └── pipeline.py    ← RAG pipeline
│
└── frontend/
    └── src/
        └── App.js         ← React frontend
```

---

## How It Works

### Mode 1 — RAG Pipeline (Document Chat)
```
Upload file → Extract text → Chunk → Embed → Store in ChromaDB
      ↓
Ask question → Embed question → Retrieve top 3 chunks → Send to Groq → Answer
```

### Mode 2 — Text-to-SQL (SQL Query)
```
Upload CSV/DB → Load into SQLite → Extract schema
      ↓
Ask question → Send schema + question to Groq → Get SQL → Run on SQLite → Return results
```

---

## Supported File Formats

| Mode | Formats |
|------|---------|
| Document Chat | PDF, DOCX, TXT, CSV, XLSX, JSON, PPTX, MD |
| SQL Query | CSV, XLSX, DB, SQLite |

---

## Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key — free at [console.groq.com](https://console.groq.com)
- Gemini API key — free at [aistudio.google.com](https://aistudio.google.com)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
python -m pip install -r requirements.txt
```

Create `.env` file in `backend/`:
```
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

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

App runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /upload | Upload and process document for RAG |
| POST | /query | Query document using natural language |
| POST | /sql/upload | Upload and load database file |
| POST | /sql/query | Query database using natural language |

---

## Deployment

- **Backend:** [Render.com](https://render.com) — `https://docquery-ai-final.onrender.com`
- **Frontend:** [Vercel](https://vercel.com) — `https://docquery-ai-omega.vercel.app`

---

## Author

**Gaurav Thakur**
- GitHub: [@GAURAV4478](https://github.com/GAURAV4478)
- LinkedIn: [linkedin.com/in/gauravthakur7](https://linkedin.com/in/gauravthakur7)
