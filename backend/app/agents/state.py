from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CitationItem(BaseModel):
    citation_id: int
    source_filename: str
    chunk_id: str
    snippet: str
    relevance_score: float = 0.0


class AgentLog(BaseModel):
    step: str
    action: str
    detail: str


class ReflectionDetail(BaseModel):
    step: str
    is_sufficient: bool
    confidence_score: float
    reason: str


class AgentState(BaseModel):
    query: str
    route: str = "retrieve"  # "retrieve" | "direct"
    documents: List[Dict[str, Any]] = []
    formatted_context: str = ""
    generation: str = ""
    citations: List[CitationItem] = []
    logs: List[AgentLog] = []

    # Phase 5 Self-RAG & Reflection Loop Fields
    is_sufficient: bool = True
    confidence_score: float = 100.0
    reflection_logs: List[ReflectionDetail] = []
    retry_count: int = 0
    max_retries: int = 2
    rewrite_query: Optional[str] = None

    def add_log(self, step: str, action: str, detail: str):
        self.logs.append(AgentLog(step=step, action=action, detail=detail))

    def add_reflection(self, step: str, is_sufficient: bool, confidence_score: float, reason: str):
        self.reflection_logs.append(
            ReflectionDetail(
                step=step,
                is_sufficient=is_sufficient,
                confidence_score=round(confidence_score, 1),
                reason=reason
            )
        )
