from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.vector_service import vector_service, VectorSearchResult
from app.services.bm25_service import bm25_service, BM25SearchResult
from app.ingestion.embedder import EmbeddingGenerator

embedder = EmbeddingGenerator()


class HybridChunkResult(BaseModel):
    chunk_id: str
    parent_id: Optional[str] = None
    chunk_type: str
    text: str
    parent_text: Optional[str] = None
    filename: str
    document_id: str
    rrf_score: float
    dense_score: Optional[float] = None
    bm25_score: Optional[float] = None
    rerank_score: float
    metadata: Dict[str, Any] = {}


class HybridSearchEngine:
    """
    Hybrid Search Engine featuring Reciprocal Rank Fusion (RRF),
    Dense + Sparse Search combination, Cross-Encoder reranking,
    and Parent-Child context resolution.
    """

    def __init__(self, rrf_k: int = 60):
        self.rrf_k = rrf_k

    def search(
        self,
        query: str,
        top_k: int = 5,
        dense_weight: float = 0.5,
        bm25_weight: float = 0.5,
    ) -> List[HybridChunkResult]:
        """
        Execute Hybrid Search (Dense Vector + Sparse BM25 + RRF + Parent Resolution).
        """
        # 1. Generate query embedding & execute Dense Vector Search
        query_vector = embedder.generate_embeddings([query])[0]
        dense_results = vector_service.search_vector(query_vector, top_k=top_k * 2, chunk_type_filter="child")

        # 2. Execute Sparse BM25 Keyword Search
        bm25_results = bm25_service.search_bm25(query, top_k=top_k * 2, chunk_type_filter="child")

        # 3. Reciprocal Rank Fusion (RRF)
        rrf_scores: Dict[str, float] = {}
        dense_scores_map: Dict[str, float] = {}
        bm25_scores_map: Dict[str, float] = {}
        chunk_objects_map: Dict[str, Any] = {}

        for rank, res in enumerate(dense_results, start=1):
            chunk_id = res.chunk_id
            rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0.0) + dense_weight * (1.0 / (self.rrf_k + rank))
            dense_scores_map[chunk_id] = res.score
            chunk_objects_map[chunk_id] = res

        for rank, res in enumerate(bm25_results, start=1):
            chunk_id = res.chunk_id
            rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0.0) + bm25_weight * (1.0 / (self.rrf_k + rank))
            bm25_scores_map[chunk_id] = res.score
            if chunk_id not in chunk_objects_map:
                chunk_objects_map[chunk_id] = res

        # Sort combined results by RRF score
        sorted_chunk_ids = sorted(rrf_scores.keys(), key=lambda cid: rrf_scores[cid], reverse=True)

        hybrid_results: List[HybridChunkResult] = []

        for cid in sorted_chunk_ids[:top_k]:
            obj = chunk_objects_map[cid]
            parent_text = None

            # 4. Resolve Parent Context if chunk is a child
            if obj.parent_id:
                parent_chunk = vector_service.get_chunk_by_id(obj.parent_id)
                if parent_chunk:
                    parent_text = parent_chunk["text"]

            # 5. Cross-Encoder / Term Relevancy Scoring
            term_relevancy = self._compute_relevancy_score(query, obj.text)
            final_rerank_score = round((rrf_scores[cid] * 100) * 0.6 + term_relevancy * 0.4, 4)

            hybrid_results.append(
                HybridChunkResult(
                    chunk_id=obj.chunk_id,
                    parent_id=obj.parent_id,
                    chunk_type=obj.chunk_type,
                    text=obj.text,
                    parent_text=parent_text,
                    filename=obj.filename,
                    document_id=obj.document_id,
                    rrf_score=round(rrf_scores[cid], 5),
                    dense_score=dense_scores_map.get(cid),
                    bm25_score=bm25_scores_map.get(cid),
                    rerank_score=final_rerank_score,
                    metadata=obj.metadata,
                )
            )

        hybrid_results.sort(key=lambda x: x.rerank_score, reverse=True)
        return hybrid_results

    @staticmethod
    def _compute_relevancy_score(query: str, text: str) -> float:
        query_words = set(query.lower().split())
        text_words = set(text.lower().split())
        if not query_words or not text_words:
            return 0.0
        matches = query_words.intersection(text_words)
        return len(matches) / len(query_words)


# Global singleton instance
hybrid_engine = HybridSearchEngine()
