from langchain_community.vectorstores import Chroma
from rag.embedder import get_embeddings

def save_to_vectorstore(chunks: list, session_id: str):
    embeddings = get_embeddings()
    vectorstore = Chroma.from_texts(
        texts=chunks,
        embedding=embeddings,
        persist_directory=f"chroma_db/{session_id}"
    )
    return vectorstore

def load_from_vectorstore(session_id: str):
    embeddings = get_embeddings()
    return Chroma(
        persist_directory=f"chroma_db/{session_id}",
        embedding_function=embeddings
    )