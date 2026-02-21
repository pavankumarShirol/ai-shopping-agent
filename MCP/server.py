# import json
# import httpx
# from fastmcp import FastMCP
# # from fastmcp.server.openapi 

# client = httpx.AsyncClient(base_url="http://localhost:4000/api-docs.json")

# mcp = FastMCP.from_openapi(
#   openapi_spec="http://localhost:4000/api-docs.json",
#   client=client,
#   name="Shopping Agent",
#   stateless_http=True,
# )

# if __name__ == "__main__":
#   mcp.run(transport="streamable-http", host="localhost", port=4001)








# 
import asyncio
import httpx
from fastmcp import FastMCP

async def main():
    async with httpx.AsyncClient() as spec_client:
        resp = await spec_client.get("http://localhost:4000/api-docs.json")
        resp.raise_for_status()
        openapi_spec = resp.json()

    api_client = httpx.AsyncClient(base_url="http://localhost:4000")

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