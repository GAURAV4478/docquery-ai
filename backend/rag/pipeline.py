from rag.chunker import chunk_text
from rag.vectorstore import save_to_vectorstore, load_from_vectorstore
from rag.generator import get_answer

def process_document(text: str, session_id: str):
    chunks = chunk_text(text)
    save_to_vectorstore(chunks, session_id)
    return len(chunks)

def query_document(question: str, session_id: str):
    vectorstore = load_from_vectorstore(session_id)
    answer = get_answer(question, vectorstore)
    return answer