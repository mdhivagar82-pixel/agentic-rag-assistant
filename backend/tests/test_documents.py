import io
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_preview_chunking():
    file_content = b"This is a test document. It contains text for testing semantic chunking."
    file = ("test.txt", io.BytesIO(file_content), "text/plain")

    response = client.post("/api/v1/documents/preview-chunking", files={"file": file})
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test.txt"
    assert "total_chunks" in data


def test_document_ingestion():
    file_content = b"Enterprise Knowledge Base Document. Contains detailed architecture parameters."
    file = ("sample_doc.txt", io.BytesIO(file_content), "text/plain")

    response = client.post("/api/v1/documents/ingest", files={"file": file})
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "sample_doc.txt"
    assert data["indexed_vectors"] > 0
