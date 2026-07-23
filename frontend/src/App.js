import { useState, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a0f;
    color: #e8e8f0;
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
  }

  .app { min-height: 100vh; background: #0a0a0f; }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 40px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(10px);
  }

  .nav-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.5px;
  }

  .nav-logo span { color: #7c6cfc; }

  .nav-badge {
    background: rgba(124,108,252,0.15);
    border: 1px solid rgba(124,108,252,0.3);
    color: #7c6cfc;
    font-size: 12px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 20px;
  }

  .hero {
    text-align: center;
    padding: 80px 40px 60px;
    position: relative;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 300px;
    background: radial-gradient(ellipse, rgba(124,108,252,0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(124,108,252,0.1);
    border: 1px solid rgba(124,108,252,0.2);
    color: #a89afd;
    font-size: 12px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 20px;
    margin-bottom: 24px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .hero h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -2px;
    margin-bottom: 16px;
    color: #fff;
  }

  .hero h1 span {
    background: linear-gradient(135deg, #7c6cfc, #a89afd, #c4b8fe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-sub {
    color: #888;
    font-size: 17px;
    max-width: 480px;
    margin: 0 auto 48px;
    line-height: 1.6;
  }

  .mode-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    max-width: 700px;
    margin: 0 auto 60px;
    padding: 0 40px;
  }

  .mode-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 28px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;
    overflow: hidden;
  }

  .mode-card:hover { border-color: rgba(124,108,252,0.4); transform: translateY(-2px); }
  .mode-card.active { border-color: #7c6cfc; background: rgba(124,108,252,0.08); }

  .mode-icon { font-size: 28px; margin-bottom: 12px; display: block; }

  .mode-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 17px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 6px;
  }

  .mode-desc { font-size: 13px; color: #666; line-height: 1.5; }

  .mode-tag {
    display: inline-block;
    margin-top: 12px;
    font-size: 11px;
    font-weight: 500;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(124,108,252,0.15);
    color: #a89afd;
  }

  .workspace { max-width: 900px; margin: 0 auto; padding: 0 40px 80px; }

  .workspace-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .workspace-header {
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .workspace-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
  }

  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #444; margin-left: auto; }
  .status-dot.active { background: #4ade80; box-shadow: 0 0 8px #4ade80; }

  .upload-zone {
    margin: 24px;
    border: 1.5px dashed rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .upload-zone:hover, .upload-zone.drag { border-color: #7c6cfc; background: rgba(124,108,252,0.05); }

  .upload-zone input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .upload-icon { font-size: 32px; margin-bottom: 12px; }
  .upload-text { font-size: 14px; color: #888; line-height: 1.6; }
  .upload-text strong { color: #a89afd; }

  .file-types { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-top: 12px; }

  .file-type-tag {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(255,255,255,0.05);
    color: #555;
    font-weight: 500;
  }

  .file-status {
    margin: 0 24px 16px;
    background: rgba(124,108,252,0.08);
    border: 1px solid rgba(124,108,252,0.2);
    border-radius: 10px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .file-status-name { font-size: 13px; font-weight: 500; color: #a89afd; flex: 1; }
  .file-status-chunks { font-size: 12px; color: #555; }

  .chat-area {
    margin: 0 24px;
    height: 280px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 8px;
    scrollbar-width: thin;
    scrollbar-color: #222 transparent;
  }

  .chat-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #333;
    font-size: 13px;
    gap: 8px;
    height: 100%;
  }

  .msg { display: flex; gap: 10px; align-items: flex-start; }
  .msg.user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
  }

  .msg.user .msg-avatar { background: rgba(124,108,252,0.2); }
  .msg.ai .msg-avatar { background: rgba(255,255,255,0.05); }

  .msg-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13.5px;
    line-height: 1.6;
  }

  .msg.user .msg-bubble {
    background: rgba(124,108,252,0.2);
    border: 1px solid rgba(124,108,252,0.3);
    color: #d4ceff;
    border-radius: 12px 2px 12px 12px;
  }

  .msg.ai .msg-bubble {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    color: #ccc;
    border-radius: 2px 12px 12px 12px;
    width: 100%;
    max-width: 100%;
  }

  .input-row { padding: 16px 24px 24px; display: flex; gap: 10px; align-items: center; }

  .chat-input {
    flex: 1;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 11px 16px;
    color: #fff;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }

  .chat-input:focus { border-color: rgba(124,108,252,0.5); }
  .chat-input::placeholder { color: #444; }
  .chat-input:disabled { opacity: 0.5; }

  .send-btn {
    background: #7c6cfc;
    border: none;
    border-radius: 10px;
    width: 42px; height: 42px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .send-btn:hover { background: #6a5ae8; transform: scale(1.05); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .loading-dots { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
  .loading-dots span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #7c6cfc;
    animation: bounce 1.2s infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-6px); opacity: 1; }
  }

  .upload-btn {
    margin: 0 24px 24px;
    width: calc(100% - 48px);
    background: #7c6cfc;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
  }

  .upload-btn:hover { background: #6a5ae8; }
  .upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* SQL TABLE */
  .table-wrapper {
    margin: 0 24px 24px;
    overflow-x: auto;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.07);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  thead {
    background: rgba(124,108,252,0.1);
  }

  th {
    padding: 10px 14px;
    text-align: left;
    color: #a89afd;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  td {
    padding: 9px 14px;
    color: #aaa;
    border-top: 1px solid rgba(255,255,255,0.04);
    white-space: nowrap;
  }

  tr:hover td { background: rgba(255,255,255,0.02); }

  .sql-badge {
    margin: 0 24px 16px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: monospace;
    font-size: 12px;
    color: #4ade80;
    overflow-x: auto;
  }

  .schema-section {
    margin: 0 24px 20px;
  }

  .schema-title {
    font-size: 12px;
    color: #555;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .schema-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .schema-tag {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    color: #666;
  }

  .schema-tag span { color: #a89afd; font-weight: 500; }

  .result-meta {
    padding: 8px 24px;
    font-size: 12px;
    color: #444;
  }
`;

export default function App() {
  const [mode, setMode] = useState(null);

  // RAG state
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [chunks, setChunks] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);
  const chatRef = useRef(null);

  // SQL state
  const [sqlFile, setSqlFile] = useState(null);
  const [sqlSessionId, setSqlSessionId] = useState(null);
  const [sqlSchema, setSqlSchema] = useState(null);
  const [sqlPreview, setSqlPreview] = useState(null);
  const [sqlFirstTable, setSqlFirstTable] = useState(null);
  const [sqlQuestion, setSqlQuestion] = useState("");
  const [sqlMessages, setSqlMessages] = useState([]);
  const [sqlUploading, setSqlUploading] = useState(false);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlDrag, setSqlDrag] = useState(false);
  const sqlChatRef = useRef(null);

  // RAG handlers
  const handleFileChange = (e) => { if (e.target.files[0]) setFile(e.target.files[0]); };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("https://docquery-ai-l62i.onrender.com/upload", { method: "POST", body: formData });
      const data = await res.json();
      setSessionId(data.session_id);
      setChunks(data.chunks);
      setMessages([{ role: "ai", text: `✅ "${data.filename}" processed into ${data.chunks} chunks. Ask me anything!` }]);
    } catch {
      setMessages([{ role: "ai", text: "❌ Upload failed. Make sure backend is running." }]);
    }
    setUploading(false);
  };

  const handleQuery = async () => {
    if (!question.trim() || !sessionId) return;
    const q = question;
    setQuestion("");
    setMessages(m => [...m, { role: "user", text: q }]);
    setLoading(true);
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
    try {
      const res = await fetch("https://docquery-ai-l62i.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, session_id: sessionId })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "ai", text: data.answer }]);
    } catch {
      setMessages(m => [...m, { role: "ai", text: "❌ Query failed." }]);
    }
    setLoading(false);
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
  };

  // SQL handlers
  const handleSqlUpload = async () => {
    if (!sqlFile) return;
    setSqlUploading(true);
    const formData = new FormData();
    formData.append("file", sqlFile);
    try {
      const res = await fetch("https://docquery-ai-l62i.onrender.com/sql/upload", { method: "POST", body: formData });
      const data = await res.json();
      setSqlSessionId(data.session_id);
      setSqlSchema(data.schema);
      setSqlPreview(data.preview);
      setSqlFirstTable(data.first_table);
      setSqlMessages([{ role: "ai", text: `✅ Database loaded! Table: "${data.first_table}" with ${data.preview.length} preview rows. Ask me anything about your data!`, type: "text" }]);
    } catch {
      setSqlMessages([{ role: "ai", text: "❌ Upload failed.", type: "text" }]);
    }
    setSqlUploading(false);
  };

  const handleSqlQuery = async () => {
    if (!sqlQuestion.trim() || !sqlSessionId) return;
    const q = sqlQuestion;
    setSqlQuestion("");
    setSqlMessages(m => [...m, { role: "user", text: q, type: "text" }]);
    setSqlLoading(true);
    setTimeout(() => sqlChatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
    try {
      const res = await fetch("https://docquery-ai-l62i.onrender.com/sql/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, session_id: sqlSessionId })
      });
      const data = await res.json();
      setSqlMessages(m => [...m, { role: "ai", type: "table", sql: data.sql, result: data.result }]);
    } catch {
      setSqlMessages(m => [...m, { role: "ai", text: "❌ Query failed.", type: "text" }]);
    }
    setSqlLoading(false);
    setTimeout(() => sqlChatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
  };

  const resetAll = () => {
    setMode(null); setFile(null); setSessionId(null); setMessages([]);
    setSqlFile(null); setSqlSessionId(null); setSqlSchema(null);
    setSqlPreview(null); setSqlMessages([]);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">Doc<span>Query</span></div>
          <div className="nav-badge">AI Powered</div>
        </nav>

        <div className="hero">
          <div className="hero-eyebrow">⚡ Powered by RAG + Groq</div>
          <h1>Chat with<br /><span>any document</span></h1>
          <p className="hero-sub">Upload a file, ask questions in plain English. Get instant answers from your own data.</p>
        </div>

        {!mode && (
          <div className="mode-grid">
            <div className="mode-card" onClick={() => setMode("rag")}>
              <span className="mode-icon">📄</span>
              <div className="mode-title">Document Chat</div>
              <div className="mode-desc">Upload PDFs, Word docs, text files and chat with them using RAG.</div>
              <span className="mode-tag">RAG Pipeline</span>
            </div>
            <div className="mode-card" onClick={() => setMode("sql")}>
              <span className="mode-icon">🗄️</span>
              <div className="mode-title">SQL Query</div>
              <div className="mode-desc">Upload a CSV or database file, visualize and query with natural language.</div>
              <span className="mode-tag">Text-to-SQL</span>
            </div>
          </div>
        )}

        {/* RAG MODE */}
        {mode === "rag" && (
          <div className="workspace">
            <div className="workspace-card">
              <div className="workspace-header">
                <span>📄</span>
                <span className="workspace-title">Document Chat</span>
                <div className={`status-dot ${sessionId ? "active" : ""}`} />
              </div>

              {!sessionId ? (
                <>
                  <div
                    className={`upload-zone ${drag ? "drag" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); setFile(e.dataTransfer.files[0]); }}
                  >
                    <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.txt,.csv,.xlsx,.json,.pptx,.md" />
                    <div className="upload-icon">{file ? "📎" : "☁️"}</div>
                    <div className="upload-text">
                      {file ? <><strong>{file.name}</strong><br />Ready to upload</> : <><strong>Drop your file here</strong> or click to browse</>}
                    </div>
                    <div className="file-types">
                      {["PDF","DOCX","TXT","CSV","XLSX","JSON","PPTX"].map(t => <span key={t} className="file-type-tag">{t}</span>)}
                    </div>
                  </div>
                  <button className="upload-btn" onClick={handleUpload} disabled={!file || uploading}>
                    {uploading ? "Processing..." : "Upload & Process File"}
                  </button>
                </>
              ) : (
                <>
                  <div className="file-status">
                    <span>📎</span>
                    <span className="file-status-name">{file?.name}</span>
                    <span className="file-status-chunks">{chunks} chunks</span>
                  </div>
                  <div className="chat-area" ref={chatRef}>
                    {messages.map((m, i) => (
                      <div key={i} className={`msg ${m.role}`}>
                        <div className="msg-avatar">{m.role === "user" ? "👤" : "🤖"}</div>
                        <div className="msg-bubble">{m.text}</div>
                      </div>
                    ))}
                    {loading && (
                      <div className="msg ai">
                        <div className="msg-avatar">🤖</div>
                        <div className="msg-bubble"><div className="loading-dots"><span/><span/><span/></div></div>
                      </div>
                    )}
                  </div>
                  <div className="input-row">
                    <input className="chat-input" placeholder="Ask anything about your document..." value={question}
                      onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && handleQuery()} disabled={loading} />
                    <button className="send-btn" onClick={handleQuery} disabled={loading || !question.trim()}>➤</button>
                  </div>
                </>
              )}
            </div>
            <p style={{ textAlign: "center", fontSize: "13px" }}>
              <span style={{ cursor: "pointer", color: "#555" }} onClick={resetAll}>← Back to home</span>
            </p>
          </div>
        )}

        {/* SQL MODE */}
        {mode === "sql" && (
          <div className="workspace">
            <div className="workspace-card">
              <div className="workspace-header">
                <span>🗄️</span>
                <span className="workspace-title">SQL Query</span>
                <div className={`status-dot ${sqlSessionId ? "active" : ""}`} />
              </div>

              {!sqlSessionId ? (
                <>
                  <div
                    className={`upload-zone ${sqlDrag ? "drag" : ""}`}
                    onDragOver={e => { e.preventDefault(); setSqlDrag(true); }}
                    onDragLeave={() => setSqlDrag(false)}
                    onDrop={e => { e.preventDefault(); setSqlDrag(false); setSqlFile(e.dataTransfer.files[0]); }}
                  >
                    <input type="file" onChange={e => { if (e.target.files[0]) setSqlFile(e.target.files[0]); }} accept=".csv,.xlsx,.db,.sqlite,.sql" />
                    <div className="upload-icon">{sqlFile ? "📊" : "🗄️"}</div>
                    <div className="upload-text">
                      {sqlFile ? <><strong>{sqlFile.name}</strong><br />Ready to upload</> : <><strong>Drop your database file here</strong> or click to browse</>}
                    </div>
                    <div className="file-types">
                      {["CSV","XLSX","DB","SQLITE"].map(t => <span key={t} className="file-type-tag">{t}</span>)}
                    </div>
                  </div>
                  <button className="upload-btn" onClick={handleSqlUpload} disabled={!sqlFile || sqlUploading}>
                    {sqlUploading ? "Loading Database..." : "Upload & Load Database"}
                  </button>
                </>
              ) : (
                <>
                  {/* Schema preview */}
                  {sqlSchema && (
                    <div className="schema-section">
                      <div className="schema-title">Database Schema</div>
                      <div className="schema-tags">
                        {Object.entries(sqlSchema).map(([table, cols]) =>
                          cols.map(col => (
                            <span key={`${table}-${col.name}`} className="schema-tag">
                              <span>{table}</span>.{col.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data preview table */}
                  {sqlPreview && sqlPreview.length > 0 && (
                    <>
                      <div className="result-meta" style={{ paddingTop: "0", paddingBottom: "6px", color: "#555" }}>
                        Preview — {sqlFirstTable}
                      </div>
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>{Object.keys(sqlPreview[0]).map(col => <th key={col}>{col}</th>)}</tr>
                          </thead>
                          <tbody>
                            {sqlPreview.map((row, i) => (
                              <tr key={i}>{Object.values(row).map((val, j) => <td key={j}>{String(val)}</td>)}</tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Chat area */}
                  <div className="chat-area" ref={sqlChatRef} style={{ height: "220px" }}>
                    {sqlMessages.map((m, i) => (
                      <div key={i} className={`msg ${m.role}`}>
                        <div className="msg-avatar">{m.role === "user" ? "👤" : "🤖"}</div>
                        <div className="msg-bubble">
                          {m.type === "table" && m.result?.success ? (
                            <>
                              <div className="sql-badge">{m.sql}</div>
                              <div style={{ marginTop: "8px", overflowX: "auto" }}>
                                <table>
                                  <thead>
                                    <tr>{m.result.columns.map(col => <th key={col}>{col}</th>)}</tr>
                                  </thead>
                                  <tbody>
                                    {m.result.rows.map((row, ri) => (
                                      <tr key={ri}>{m.result.columns.map((col, ci) => <td key={ci}>{String(row[col])}</td>)}</tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div style={{ fontSize: "11px", color: "#444", marginTop: "6px" }}>{m.result.count} rows returned</div>
                              </div>
                            </>
                          ) : m.type === "table" && !m.result?.success ? (
                            <span style={{ color: "#f87171" }}>❌ {m.result?.error}</span>
                          ) : m.text}
                        </div>
                      </div>
                    ))}
                    {sqlLoading && (
                      <div className="msg ai">
                        <div className="msg-avatar">🤖</div>
                        <div className="msg-bubble"><div className="loading-dots"><span/><span/><span/></div></div>
                      </div>
                    )}
                  </div>

                  <div className="input-row">
                    <input className="chat-input" placeholder="Ask anything about your data..." value={sqlQuestion}
                      onChange={e => setSqlQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSqlQuery()} disabled={sqlLoading} />
                    <button className="send-btn" onClick={handleSqlQuery} disabled={sqlLoading || !sqlQuestion.trim()}>➤</button>
                  </div>
                </>
              )}
            </div>
            <p style={{ textAlign: "center", fontSize: "13px" }}>
              <span style={{ cursor: "pointer", color: "#555" }} onClick={resetAll}>← Back to home</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}