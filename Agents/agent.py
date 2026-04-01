import os
from pathlib import Path
from dotenv import load_dotenv
from collections import defaultdict

from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import wrap_tool_call, PIIMiddleware
from langchain.messages import ToolMessage
from langchain_mcp_adapters.client import MultiServerMCPClient

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.tools import tool

from langfuse import Langfuse, get_client
from langfuse.langchain import CallbackHandler

# --------------------------------------------------
# ENV
# --------------------------------------------------

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

if not os.getenv("GROQ_API_KEY"):
    raise RuntimeError("GROQ_API_KEY not found in .env")

# Initialize Langfuse client with constructor arguments
Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
    host=os.getenv("LANGFUSE_BASE_URL") 
)

# Get the configured client instance
langfuse = get_client()

# Initialize the Langfuse handler
langfuse_handler = CallbackHandler()

# --------------------------------------------------
# SESSION STORE (PER CONVERSATION)
# --------------------------------------------------

SESSION_STORE: dict[str, list] = defaultdict(list)


# --------------------------------------------------
# Middleware
# --------------------------------------------------

@wrap_tool_call
async def handle_tool_errors(request, handler):
    try:
        return await handler(request)
    except Exception as e:
        return ToolMessage(
            content=f"Tool error: {str(e)}",
            tool_call_id=request.tool_call["id"]
        )


# --------------------------------------------------
# RAG FAQ SETUP
# --------------------------------------------------

FAQ_PATH = "data/FAQ.pdf"

loader = PyPDFLoader(FAQ_PATH)
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

splits = text_splitter.split_documents(docs)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001"
)


faq_vector_store = FAISS.from_documents(splits, embeddings)


# --------------------------------------------------
# FAQ TOOL (RAG)
# --------------------------------------------------

@tool
def retrieve_faq(query: str) -> str:
    """
    Search the ecommerce FAQ document to answer customer support questions.
    Use this when the user asks about returns, delivery, payment, refunds, etc.
    """

    results = faq_vector_store.similarity_search(query, k=3)

    context = "\n\n".join(
        doc.page_content for doc in results
    )

    return context

# --------------------------------------------------
# Agent State
# --------------------------------------------------

class CustomState(AgentState):
    user_preferences: dict


# --------------------------------------------------
# MCP Config
# --------------------------------------------------

# BASE_URL = "https://ai-shopping-agent-mcp-server.onrender.com/mcp"
BASE_URL = "http://127.0.0.1:4001/mcp"


# --------------------------------------------------
# Agent Factory (Singleton)
# --------------------------------------------------

_agent_instance = None


async def get_agent():
    global _agent_instance

    if _agent_instance is not None:
        return _agent_instance

    print("🔄 Initializing shopping agent...")

    client = MultiServerMCPClient(
        {
            "shopping-agent": {
                "url": BASE_URL,
                "transport": "streamable-http",
            }
        }
    )

    mcp_tools = await client.get_tools()
    
    tools = mcp_tools + [retrieve_faq]

    agent = create_agent(
        model="groq:llama-3.1-8b-instant",
        tools=tools,
        system_prompt="""

        you are a shopping agent for our store ShopHub online store.
        - you first analyse which all tools you have access and tell user that what you can do for them.
        - based on user input you decide which tool to use and what parameters to pass to the tool. remember for some tools need user_id use id as u101 as of now.
        - search_products tool has to be used when user wants to search for any product, you have to pass the product name as query parameter to that tool and then show the search results to user in a beautiful markdown format with product name, price and image one below the other.
        - when user says add product to cart then you have to call the Add_product_to_cart tool. and while adding product to cart you have to take the product id from the search results shown to user and then pass that product id to Add_product_to_cart tool.
        - chekout process has to proceed like this first you have to call the Get_all_addresses_for_a_user tool and show the addresses information(show full infomation as received from response) to user and ask which address they want to use for delivery then you have to call the Get_all_payment_methods_for_a_user(show full infomation as received from response) tool and show the payment methods details to user and ask which payment method they want to use for payment and then you have to tell user that i have selected this payment method and then call the Place_order tool with the address and payment method details to complete the order.
        - show the all response from the tool in the markdown easily readable format.
        - if response has the image url then show the image in the markdown response.
        - for search results show the product name, price and image in the markdown response, one below the other.
        - if any user greets you then greet them back in a friendly manner and ask how can you help them.
        - add emojis in your response to make it more friendly and attractive.
        - give your introduction in the first response when user interacts with you for the first time like "Hi I am ShopHub your shopping assistant, I can help you to find products, add products to cart and place order. How can I help you today? in  buatuify readable markdown format with emojis with line breaks.
        - if user asks questions about queries related to delivery, payment, returns, refunds then you have to use the retrieve_faq tool to find the answer from the FAQ document and answer user queries based on that returned information.
        - if user gives any PII information tell like dont give me your personal information for security reasons and if you have to use that information for any tool then mask that information and then use it in the tool..
        
        
""",
# - for every queries you have to use the tools to find the answer and respond to user queries based on that, dont try to answer user queries without using the tools.
        middleware=[
            handle_tool_errors,
            PIIMiddleware(
                "credit_card",
                strategy="mask",
                apply_to_input=True,
            ),
            PIIMiddleware(
                "email",
                strategy="redact",
                apply_to_input=True,
            )
            ],
        state_schema=CustomState,
    )

    _agent_instance = agent
    print("✅ Agent initialized")
    return agent


# --------------------------------------------------
# Streaming with Session Memory
# --------------------------------------------------

async def stream_agent_response(user_input: str, session_id: str):
    agent = await get_agent()

    history = SESSION_STORE[session_id]

    # Add user message to memory 
    history.append({
        "role": "user",
        "content": user_input
    })

    final_assistant_message = None

    async for chunk in agent.astream(
        {"messages": history},
        stream_mode="updates",
        config={"callbacks": [langfuse_handler]}
    ):
        for step, data in chunk.items():
            if not data or "messages" not in data:
                continue
            
            msg = data["messages"][-1]
            final_assistant_message = msg

            yield {
                "step": step,
                "type": msg.type,
                "content": (
                    msg.content_blocks
                    if hasattr(msg, "content_blocks")
                    else msg.content
                ),
            }

    # Persist assistant response after stream ends
    if final_assistant_message:
        history.append({
            "role": "assistant",
            "content": final_assistant_message.content
        })