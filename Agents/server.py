from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

from agent import stream_agent_response


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AgentRequest(BaseModel):
    message: str
    session_id: str


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/chat/stream")
async def chat_stream(req: AgentRequest):

    async def generator():
        async for chunk in stream_agent_response(
            req.message,
            req.session_id
        ):
            yield json.dumps(chunk) + "\n"

    return StreamingResponse(
        generator(),
        media_type="application/json"
    )