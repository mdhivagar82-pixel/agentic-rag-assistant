import uuid
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DocumentChunk(BaseModel):
    chunk_id: str
    parent_id: Optional[str] = None
    chunk_type: str  # "parent" | "child"
    text: str
    token_count_approx: int
    metadata: Dict[str, Any] = {}


class SemanticChunker:
    """
    Semantic & Parent-Child Chunker for high precision & recall retrieval.
    """

    def __init__(
        self,
        parent_chunk_size: int = 1500,
        parent_overlap: int = 200,
        child_chunk_size: int = 400,
        child_overlap: int = 50,
    ):
        self.parent_chunk_size = parent_chunk_size
        self.parent_overlap = parent_overlap
        self.child_chunk_size = child_chunk_size
        self.child_overlap = child_overlap

    def chunk_document(
        self, text: str, document_id: str, filename: str
    ) -> List[DocumentChunk]:
        all_chunks: List[DocumentChunk] = []

        # Step 1: Split into Parent Chunks
        parent_texts = self._sliding_window_split(
            text, self.parent_chunk_size, self.parent_overlap
        )

        for p_idx, p_text in enumerate(parent_texts):
            p_id = f"parent_{document_id}_{p_idx}_{uuid.uuid4().hex[:6]}"
            parent_chunk = DocumentChunk(
                chunk_id=p_id,
                parent_id=None,
                chunk_type="parent",
                text=p_text,
                token_count_approx=len(p_text.split()),
                metadata={
                    "document_id": document_id,
                    "filename": filename,
                    "parent_index": p_idx,
                },
            )
            all_chunks.append(parent_chunk)

            # Step 2: Split Parent Chunk into Child Chunks
            child_texts = self._sliding_window_split(
                p_text, self.child_chunk_size, self.child_overlap
            )

            for c_idx, c_text in enumerate(child_texts):
                c_id = f"child_{p_id}_{c_idx}"
                child_chunk = DocumentChunk(
                    chunk_id=c_id,
                    parent_id=p_id,
                    chunk_type="child",
                    text=c_text,
                    token_count_approx=len(c_text.split()),
                    metadata={
                        "document_id": document_id,
                        "filename": filename,
                        "parent_id": p_id,
                        "child_index": c_idx,
                    },
                )
                all_chunks.append(child_chunk)

        return all_chunks

    def _sliding_window_split(
        self, text: str, chunk_size: int, overlap: int
    ) -> List[str]:
        # Split on paragraph boundaries first if possible
        paragraphs = [p.strip() for p in re.split(r"\n\n+", text) if p.strip()]
        chunks: List[str] = []
        current_chunk: List[str] = []
        current_len = 0

        for p in paragraphs:
            if current_len + len(p) <= chunk_size:
                current_chunk.append(p)
                current_len += len(p)
            else:
                if current_chunk:
                    chunks.append("\n\n".join(current_chunk))
                # Start new chunk with overlap
                current_chunk = [p]
                current_len = len(p)

        if current_chunk:
            chunks.append("\n\n".join(current_chunk))

        # Fallback for large paragraphs without linebreaks
        final_chunks: List[str] = []
        for c in chunks:
            if len(c) <= chunk_size:
                final_chunks.append(c)
            else:
                # Character level sliding window with overlap
                start = 0
                while start < len(c):
                    end = start + chunk_size
                    snippet = c[start:end]
                    final_chunks.append(snippet)
                    start += chunk_size - overlap

        return final_chunks if final_chunks else [text]
