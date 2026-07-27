import math
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.ingestion.chunker import DocumentChunk
from app.core.config import settings


class VectorSearchResult(BaseModel):
    chunk_id: str
    parent_id: Optional[str] = None
    chunk_type: str
    text: str
    filename: str
    document_id: str
    score: float
    metadata: Dict[str, Any] = {}


class VectorService:
    """
    Vector Store Service managing embeddings storage, payload indexing,
    and cosine similarity vector retrieval.
    """

    def __init__(self):
        # In-memory vector index store with Qdrant collection payload schema
        self._vector_store: List[Dict[str, Any]] = []

    def upsert_chunks(
        self, chunks: List[DocumentChunk], embeddings: List[List[float]]
    ) -> int:
        """
        Store or update document chunks with their dense vector embeddings.
        """
        upserted_count = 0
        for chunk, embedding in zip(chunks, embeddings):
            record = {
                "chunk_id": chunk.chunk_id,
                "parent_id": chunk.parent_id,
                "chunk_type": chunk.chunk_type,
                "text": chunk.text,
                "token_count": chunk.token_count_approx,
                "filename": chunk.metadata.get("filename", "unknown"),
                "document_id": chunk.metadata.get("document_id", "doc_0"),
                "embedding": embedding,
                "metadata": chunk.metadata,
            }
            
            # Remove existing record if matching chunk_id
            self._vector_store = [r for r in self._vector_store if r["chunk_id"] != chunk.chunk_id]
            self._vector_store.append(record)
            upserted_count += 1

        return upserted_count

    def search_vector(
        self,
        query_vector: List[float],
        top_k: int = 10,
        chunk_type_filter: Optional[str] = "child",
    ) -> List[VectorSearchResult]:
        """
        Perform dense cosine similarity vector search over stored embeddings.
        """
        results: List[VectorSearchResult] = []

        for record in self._vector_store:
            if chunk_type_filter and record["chunk_type"] != chunk_type_filter:
                continue

            similarity = self._cosine_similarity(query_vector, record["embedding"])
            results.append(
                VectorSearchResult(
                    chunk_id=record["chunk_id"],
                    parent_id=record["parent_id"],
                    chunk_type=record["chunk_type"],
                    text=record["text"],
                    filename=record["filename"],
                    document_id=record["document_id"],
                    score=round(similarity, 4),
                    metadata=record["metadata"],
                )
            )

        # Sort by similarity score descending
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]

    def get_chunk_by_id(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        for record in self._vector_store:
            if record["chunk_id"] == chunk_id:
                return record
        return None

    def delete_document_chunks(self, document_id: str) -> int:
        initial_len = len(self._vector_store)
        self._vector_store = [r for r in self._vector_store if r["document_id"] != document_id]
        return initial_len - len(self._vector_store)

    @staticmethod
    def _cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)


# Global singleton instance
vector_service = VectorService()
