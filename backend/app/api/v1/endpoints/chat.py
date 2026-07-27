import json
import asyncio
from typing import AsyncGenerator, List
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.agents.graph import langgraph_engine
from app.agents.state import AgentState, CitationItem, ReflectionDetail, AgentLog
from app.core.security import verify_firebase_token, sanitize_input, RateLimiter

router = APIRouter()
rate_limiter = RateLimiter(requests_per_minute=60)


class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or prompt for knowledge base search.")
    stream: bool = Field(default=True, description="Enable Server-Sent Events (SSE) token streaming.")


class ChatResponse(BaseModel):
    query: str
    answer: str
    confidence_score: float
    citations: List[CitationItem] = []
    reflection_logs: List[ReflectionDetail] = []
    logs: List[AgentLog] = []


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Execute Multi-Agent RAG Chat",
    description="Executes LangGraph Self-RAG agent workflow with Gemini LLM synthesis and returns streaming SSE or JSON response.",
    dependencies=[Depends(rate_limiter)]
)
async def chat_endpoint(
    request: ChatRequest,
    user: dict = Depends(verify_firebase_token)
):
    """
    FastAPI Chat API Endpoint returning streaming SSE responses or full JSON response.
    Executes LangGraph Self-RAG Reflection Workflow.
    """
    clean_message = sanitize_input(request.message)
    if not clean_message:
        raise HTTPException(status_code=400, detail="Chat message cannot be empty.")

    if not request.stream:
        # Non-streaming JSON response
        final_state: AgentState = langgraph_engine.run(clean_message)
        return ChatResponse(
            query=final_state.query,
            answer=final_state.generation or "",
            confidence_score=final_state.confidence_score,
            citations=final_state.citations,
            reflection_logs=final_state.reflection_logs,
            logs=final_state.logs
        )

    # Streaming SSE Response
    return StreamingResponse(
        event_stream_generator(clean_message),
        media_type="text/event-stream"
    )


async def event_stream_generator(message: str) -> AsyncGenerator[str, None]:
    """
    Optimized SSE event generator with heartbeats, client disconnect handling,
    and structured event streaming.
    """
    try:
        # Initial Heartbeat Event
        yield f"data: {json.dumps({'type': 'ping', 'status': 'connected'})}\n\n"
        await asyncio.sleep(0.01)

        # Run LangGraph Self-RAG Workflow
        state: AgentState = langgraph_engine.run(message)

        # 1. Stream Agent Execution Logs
        for log in state.logs:
            event_data = {
                "type": "agent_thought",
                "step": log.step,
                "action": log.action,
                "detail": log.detail
            }
            yield f"data: {json.dumps(event_data)}\n\n"
            await asyncio.sleep(0.04)

        # Heartbeat
        yield f"data: {json.dumps({'type': 'ping'})}\n\n"

        # 2. Stream Reflection Verification Logs
        if state.reflection_logs:
            ref_data = {
                "type": "reflection_logs",
                "reflection_logs": [r.model_dump() for r in state.reflection_logs]
            }
            yield f"data: {json.dumps(ref_data)}\n\n"

        # 3. Stream Citations
        if state.citations:
            citations_data = {
                "type": "citations",
                "citations": [c.model_dump() for c in state.citations]
            }
            yield f"data: {json.dumps(citations_data)}\n\n"

        # 4. Stream Confidence Score
        confidence_data = {
            "type": "confidence_score",
            "confidence_score": state.confidence_score
        }
        yield f"data: {json.dumps(confidence_data)}\n\n"

        # 5. Stream Answer Tokens
        answer_text = state.generation or ""
        words = answer_text.split(" ")
        for i, word in enumerate(words):
            token_payload = {
                "type": "token",
                "content": word + (" " if i < len(words) - 1 else "")
            }
            yield f"data: {json.dumps(token_payload)}\n\n"
            await asyncio.sleep(0.02)

        # 6. Stream Completion Event
        yield f"data: {json.dumps({'type': 'done', 'confidence_score': state.confidence_score})}\n\n"

    except asyncio.CancelledError:
        # Graceful Client Disconnect Handling
        pass
    except Exception as e:
        error_payload = {"type": "error", "message": f"Streaming error: {str(e)}"}
        yield f"data: {json.dumps(error_payload)}\n\n"
