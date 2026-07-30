from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(text: str):
    text_length = len(text)
    
    if text_length < 500:
        # Very short — certificates, receipts
        chunk_size = 50
        chunk_overlap = 10
    elif text_length < 1000:
        # Short — 1 page docs
        chunk_size = 100
        chunk_overlap = 20
    elif text_length < 10000:
        # Medium — 2-10 pages
        chunk_size = 300
        chunk_overlap = 30
    elif text_length < 50000:
        # Large — 10-50 pages
        chunk_size = 500
        chunk_overlap = 50
    else:
        # Very large — books, reports 50+ pages
        chunk_size = 800
        chunk_overlap = 80
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    chunks = splitter.split_text(text)
    return chunks