from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        task_type="retrieval_document"
    )