
import asyncio
import os
from dotenv import load_dotenv
from pathlib import Path

from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient

from langchain.agents.middleware import wrap_tool_call
from langchain.messages import ToolMessage

from langchain.agents import AgentState

# Load .env file explicitly
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Verify API key is loaded
if not os.getenv('GROQ_API_KEY'):
    raise ValueError("GROQ_API_KEY not found in .env file")
  
@wrap_tool_call
async def handle_tool_errors(request, handler):
    """Handle tool execution errors with custom messages."""
    try:
        return await handler(request)
    except Exception as e:
        # Return a custom error message to the model
        return ToolMessage(
            content=f"Tool error: Please check your input and try again. ({str(e)})",
            tool_call_id=request.tool_call["id"]
        )
        
class CustomState(AgentState):
    user_preferences: dict

async def main():
    client = MultiServerMCPClient(
        {
            "shopping-agent": {
                "url": "http://localhost:4001/mcp", "transport": "streamable-http"
                }
            }
        )
    tools = await client.get_tools()
    
    print("Shopping Agent Chat (type 'exit' to quit)")
    print("-" * 40)
    agent = create_agent(
        model="groq:llama-3.1-8b-instant",
        tools=tools,
        system_prompt="""
        you are a shopping agent for our store THON store.
        - you first analyse which all tools you have access and tell user that what you can do for them.
        - based on user input you decide which tool to use and what parameters to pass to the tool. remember for some tools need user_id use id as u101 as of now.
        - chekout process has to proceed like this first you have to call the Get_all_addresses_for_a_user tool and show the addresses information(show full infomation as received from response) to user and ask which address they want to use for delivery then you have to call the Get_all_payment_methods_for_a_user(show full infomation as received from response) tool and show the payment methods details to user and ask which payment method they want to use for payment and then you have to call the Place_order tool with the address and payment method details to complete the order.
        - show the response from the tool in the markdown easily readable format.
        """, 
        middleware=[handle_tool_errors],
        state_schema=CustomState
    )  

    history = []
    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() == 'exit':
            print("Goodbye!")
            break
        if not user_input:
            continue
        history.append({"role": "user", "content": user_input})
        print("Agent (streaming):")
        async for chunk in agent.astream({"messages": history}, stream_mode="updates"):
            for step, data in chunk.items():
                print(f"step: {step}")
                print(f"content: {data['messages'][-1].content_blocks}")

asyncio.run(main())