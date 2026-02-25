
# 
import asyncio
import httpx
from fastmcp import FastMCP

BACKEND_BASE_URL = "https://ai-shopping-agent-el0o.onrender.com"

async def main():
    
    timeout = httpx.Timeout(
    connect=30.0,
    read=60.0,
    write=30.0,
    pool=30.0,
   )
    
    async with httpx.AsyncClient(timeout=timeout) as spec_client:
        resp = await spec_client.get(f"{BACKEND_BASE_URL}/api-docs.json")
        resp.raise_for_status()
        openapi_spec = resp.json()

    api_client = httpx.AsyncClient(base_url=BACKEND_BASE_URL, timeout=timeout)

    mcp = FastMCP.from_openapi(
        openapi_spec=openapi_spec,
        client=api_client,
        name="Shopping Agent",
    )

    #  stateless_http goes HERE
    await mcp.run_http_async(
        host="localhost",
        port=4001,
        stateless_http=True,
    )

if __name__ == "__main__":
    asyncio.run(main())