import os
from pathlib import Path
from dotenv import load_dotenv
from collections import defaultdict

from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import wrap_tool_call
from langchain.messages import ToolMessage
from langchain_mcp_adapters.client import MultiServerMCPClient


# --------------------------------------------------
# ENV
# --------------------------------------------------

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

if not os.getenv("GROQ_API_KEY"):
    raise RuntimeError("GROQ_API_KEY not found in .env")


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
# Agent State
# --------------------------------------------------

class CustomState(AgentState):
    user_preferences: dict


# --------------------------------------------------
# MCP Config
# --------------------------------------------------

BASE_URL = "https://ai-shopping-agent-mcp-server.onrender.com/mcp"


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

    tools = await client.get_tools()

    agent = create_agent(
        model="groq:llama-3.1-8b-instant",
        tools=tools,
        system_prompt="""
you are a shopping agent for our store ShopHub store.

- Explain what you can help with (from user perspective only)
- Decide tools and parameters automatically
- user_id is always u101
- Checkout flow:
  1. Get addresses → ask user
  2. Select address
  3. Get payment methods → ask user + CVV
  4. Select payment
  5. Place order
- Render all tool responses in clean markdown
""",
        middleware=[handle_tool_errors],
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
        stream_mode="updates"
    ):
        for step, data in chunk.items():
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