from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_chat_non_streaming():
    payload = {"message": "Hello assistant, who are you?", "stream": False}
    response = client.post("/api/v1/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "confidence_score" in data
    assert "citations" in data
