from fastapi import APIRouter
from app.api.v1.endpoints import health, documents, retrieval, agent, chat

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(chat.router, tags=["LangGraph Gemini Chat"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Ingestion"])
api_router.include_router(retrieval.router, prefix="/retrieval", tags=["Hybrid Retrieval Engine"])
api_router.include_router(agent.router, prefix="/agent", tags=["Multi-Agent Workflow Engine"])
