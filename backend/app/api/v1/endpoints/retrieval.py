from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from app.services.hybrid_search import hybrid_engine, HybridChunkResult

router = APIRouter()


class RetrievalRequest(BaseModel):
    query: str
    top_k: int = 5
    dense_weight: float = 0.5
    bm25_weight: float = 0.5


class RetrievalResponse(BaseModel):
    query: str
    total_results: int
    results: List[HybridChunkResult]


@router.post("/search", response_model=RetrievalResponse)
async def hybrid_retrieval_search(
    request: RetrievalRequest
) -> RetrievalResponse:
    """
    Execute Hybrid Search across indexed documents using Dense Vector + BM25 + RRF + Reranking.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    results = hybrid_engine.search(
        query=request.query,
        top_k=request.top_k,
        dense_weight=request.dense_weight,
        bm25_weight=request.bm25_weight
    )

    return RetrievalResponse(
        query=request.query,
        total_results=len(results),
        results=results
    )
