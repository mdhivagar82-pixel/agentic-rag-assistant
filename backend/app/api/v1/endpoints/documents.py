import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel

from app.ingestion.parser import DocumentParser, ParsedDocument
from app.ingestion.chunker import SemanticChunker, DocumentChunk
from app.ingestion.embedder import EmbeddingGenerator
from app.services.vector_service import vector_service
from app.services.bm25_service import bm25_service

router = APIRouter()
chunker = SemanticChunker()
embedder = EmbeddingGenerator()


class IngestResponse(BaseModel):
    document_id: str
    filename: str
    file_type: str
    char_count: int
    word_count: int
    parent_chunks_count: int
    child_chunks_count: int
    indexed_vectors: int
    message: str


class PreviewChunkResponse(BaseModel):
    filename: str
    total_chunks: int
    chunks: List[DocumentChunk]


@router.post("/ingest", response_model=IngestResponse)
async def ingest_document(
    file: UploadFile = File(...),
) -> IngestResponse:
    """
    Ingest a document (PDF, DOCX, TXT, MD): parse text, generate semantic
    parent-child chunks, create embeddings, and index into Vector DB & BM25.
    """
    try:
        content = await file.read()
        filename = file.filename or "uploaded_doc.txt"
        document_id = f"doc_{uuid.uuid4().hex[:8]}"

        # Step 1: Parse Document
        parsed_doc: ParsedDocument = DocumentParser.parse_file(content, filename)

        if not parsed_doc.text.strip():
            raise HTTPException(status_code=400, detail="Uploaded file contains no readable text.")

        # Step 2: Semantic & Parent-Child Chunking
        chunks: List[DocumentChunk] = chunker.chunk_document(
            text=parsed_doc.text,
            document_id=document_id,
            filename=filename
        )

        parent_chunks = [c for c in chunks if c.chunk_type == "parent"]
        child_chunks = [c for c in chunks if c.chunk_type == "child"]

        # Step 3: Embeddings Generation for Chunks
        chunk_texts = [c.text for c in chunks]
        embeddings = embedder.generate_embeddings(chunk_texts)

        # Step 4: Index into Vector DB & BM25
        upserted_vectors = vector_service.upsert_chunks(chunks, embeddings)
        bm25_service.index_chunks(chunks)

        return IngestResponse(
            document_id=document_id,
            filename=filename,
            file_type=parsed_doc.file_type,
            char_count=parsed_doc.char_count,
            word_count=parsed_doc.word_count,
            parent_chunks_count=len(parent_chunks),
            child_chunks_count=len(child_chunks),
            indexed_vectors=upserted_vectors,
            message="Document successfully processed and indexed into Hybrid Retrieval Engine."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document ingestion failed: {str(e)}")


@router.post("/preview-chunking", response_model=PreviewChunkResponse)
async def preview_chunking(
    file: UploadFile = File(...),
) -> PreviewChunkResponse:
    """
    Preview semantic parent-child chunking breakdown without persisting vectors.
    """
    content = await file.read()
    filename = file.filename or "preview_doc.txt"
    document_id = "preview_doc"

    parsed_doc = DocumentParser.parse_file(content, filename)
    chunks = chunker.chunk_document(parsed_doc.text, document_id, filename)

    return PreviewChunkResponse(
        filename=filename,
        total_chunks=len(chunks),
        chunks=chunks
    )
