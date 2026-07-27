import math
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.ingestion.chunker import DocumentChunk


class BM25SearchResult(BaseModel):
    chunk_id: str
    parent_id: Optional[str] = None
    chunk_type: str
    text: str
    filename: str
    document_id: str
    score: float
    metadata: Dict[str, Any] = {}


class BM25Service:
    """
    Sparse BM25 Keyword Search Engine for exact terminology and lexical retrieval.
    """

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus: List[Dict[str, Any]] = []
        self.doc_lengths: List[int] = []
        self.avg_doc_len: float = 0.0
        self.doc_freqs: Dict[str, int] = {}
        self.total_docs: int = 0

    def index_chunks(self, chunks: List[DocumentChunk]):
        """
        Build sparse BM25 inverted index from document chunks.
        """
        for chunk in chunks:
            tokens = self._tokenize(chunk.text)
            doc_record = {
                "chunk_id": chunk.chunk_id,
                "parent_id": chunk.parent_id,
                "chunk_type": chunk.chunk_type,
                "text": chunk.text,
                "tokens": tokens,
                "filename": chunk.metadata.get("filename", "unknown"),
                "document_id": chunk.metadata.get("document_id", "doc_0"),
                "metadata": chunk.metadata,
            }
            
            # Remove existing record if matching chunk_id
            self.corpus = [c for c in self.corpus if c["chunk_id"] != chunk.chunk_id]
            self.corpus.append(doc_record)

        self._rebuild_index()

    def search_bm25(
        self, query: str, top_k: int = 10, chunk_type_filter: Optional[str] = "child"
    ) -> List[BM25SearchResult]:
        """
        Execute BM25 keyword search against indexed corpus.
        """
        if not self.corpus or self.total_docs == 0:
            return []

        query_tokens = self._tokenize(query)
        scores: List[BM25SearchResult] = []

        for idx, doc in enumerate(self.corpus):
            if chunk_type_filter and doc["chunk_type"] != chunk_type_filter:
                continue

            score = self._compute_bm25_score(query_tokens, doc["tokens"], self.doc_lengths[idx])
            if score > 0:
                scores.append(
                    BM25SearchResult(
                        chunk_id=doc["chunk_id"],
                        parent_id=doc["parent_id"],
                        chunk_type=doc["chunk_type"],
                        text=doc["text"],
                        filename=doc["filename"],
                        document_id=doc["document_id"],
                        score=round(score, 4),
                        metadata=doc["metadata"],
                    )
                )

        scores.sort(key=lambda x: x.score, reverse=True)
        return scores[:top_k]

    def _rebuild_index(self):
        self.total_docs = len(self.corpus)
        self.doc_lengths = [len(doc["tokens"]) for doc in self.corpus]
        self.avg_doc_len = sum(self.doc_lengths) / self.total_docs if self.total_docs > 0 else 0.0

        # Calculate document frequency for all terms
        self.doc_freqs = {}
        for doc in self.corpus:
            unique_terms = set(doc["tokens"])
            for term in unique_terms:
                self.doc_freqs[term] = self.doc_freqs.get(term, 0) + 1

    def _compute_bm25_score(
        self, query_tokens: List[str], doc_tokens: List[str], doc_len: int
    ) -> float:
        score = 0.0
        doc_term_counts: Dict[str, int] = {}
        for t in doc_tokens:
            doc_term_counts[t] = doc_term_counts.get(t, 0) + 1

        for term in query_tokens:
            if term not in doc_term_counts:
                continue

            df = self.doc_freqs.get(term, 0)
            tf = doc_term_counts[term]

            # IDF Calculation
            idf = math.log((self.total_docs - df + 0.5) / (df + 0.5) + 1)
            
            # TF Normalization
            numerator = tf * (self.k1 + 1)
            denominator = tf + self.k1 * (1 - self.b + self.b * (doc_len / self.avg_doc_len))
            
            score += idf * (numerator / denominator)

        return score

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        # Lowercase and split on non-alphanumeric words
        words = re.findall(r"\b\w+\b", text.lower())
        return [w for w in words if len(w) > 1]


# Global singleton instance
bm25_service = BM25Service()
