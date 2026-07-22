from langchain_groq import ChatGroq
import os

def get_answer(question: str, vectorstore):
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=os.getenv("GROQ_API_KEY")
    )

    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    docs = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in docs])

    from langchain_core.messages import SystemMessage, HumanMessage
    messages = [
        SystemMessage(content="You are a helpful document assistant. Answer questions based only on the provided context. If the answer is not in the context, say 'I could not find this information in the document.' Be concise and accurate."),
        HumanMessage(content=f"Context:\n{context}\n\nQuestion: {question}")
    ]

    response = llm.invoke(messages)
    return response.content