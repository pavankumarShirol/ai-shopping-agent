from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain.tools import tool
from langchain.agents import create_agent
from dotenv import load_dotenv
from pathlib import Path
import os

# Load env variables
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# -----------------------------
# Load PDF
# -----------------------------
file_path = "data/FAQ.pdf"
loader = PyPDFLoader(file_path)
docs = loader.load()

# -----------------------------
# Split Documents
# -----------------------------
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

splits = text_splitter.split_documents(docs)

# -----------------------------
# Embeddings
# -----------------------------
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001"
)

# -----------------------------
# Vector Store
# -----------------------------
vector_store = InMemoryVectorStore(embeddings)
vector_store.add_documents(splits)


# -----------------------------
# Tool for Retrieval
# -----------------------------
@tool
def retrieve_context(query: str) -> str:
    """Search the FAQ document and return relevant information."""
    
    results = vector_store.similarity_search(query, k=3)

    context = "\n\n".join(
        f"{doc.page_content}" for doc in results
    )

    return context


# -----------------------------
# Create Agent
# -----------------------------
agent = create_agent(
    model="groq:llama-3.1-8b-instant",
    tools=[retrieve_context],
    system_prompt="""
You are a customer support assistant for an ecommerce website.

When a user asks a question:
1. Use the retrieve_context tool to search the FAQ document.
2. Use the retrieved information to answer the user clearly.
3. If the answer is not in the document, say you could not find it.
"""
)


# -----------------------------
# Terminal Chat Loop
# -----------------------------
def main():

    print("\nEcommerce FAQ Agent Ready")
    print("Type 'exit' to quit\n")

    while True:

        user_question = input("User: ")

        if user_question.lower() == "exit":
            break

        response = agent.invoke(
            {"messages": [{"role": "user", "content": user_question}]}
        )

        print("\nAgent:", response["messages"][-1].content)
        print()


if __name__ == "__main__":
    main()