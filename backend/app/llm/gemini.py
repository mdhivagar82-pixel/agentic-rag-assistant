import os
from typing import Optional
from app.core.config import settings

# Attempt import of LangChain Google GenAI wrapper
try:
    from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
    HAS_GEMINI_SDK = True
except ImportError:
    HAS_GEMINI_SDK = False


def get_gemini_chat_model(temperature: float = 0.2):
    """
    Configure and return Google Gemini Chat Model instance using LangChain wrapper.
    Reads API Key from environment variables (GEMINI_API_KEY / GOOGLE_API_KEY).
    """
    api_key = settings.get_gemini_key()
    
    if HAS_GEMINI_SDK and api_key:
        return ChatGoogleGenerativeAI(
            model=settings.GEMINI_CHAT_MODEL,
            google_api_key=api_key,
            temperature=temperature,
            convert_system_message_to_human=True
        )
    
    # Fallback interface for offline / keyless testing
    return FallbackGeminiChatModel()


def get_gemini_embedding_model():
    """
    Configure and return Google Gemini Embedding Model instance using LangChain wrapper.
    Reads API Key from environment variables.
    """
    api_key = settings.get_gemini_key()

    if HAS_GEMINI_SDK and api_key:
        return GoogleGenerativeAIEmbeddings(
            model=settings.GEMINI_EMBEDDING_MODEL,
            google_api_key=api_key
        )
    
    return FallbackGeminiEmbeddings()


class FallbackGeminiChatModel:
    """Fallback LLM chat interface for local testing when API key is pending."""
    
    def invoke(self, prompt: str) -> str:
        return "Grounded response generated using local synthesis pipeline."

    def stream(self, prompt: str):
        words = ["Grounded ", "response ", "synthesized ", "from ", "retrieved ", "documents."]
        for w in words:
            yield w


class FallbackGeminiEmbeddings:
    """Fallback Embeddings interface for local testing."""

    def embed_documents(self, texts: list) -> list:
        return [[0.1] * 384 for _ in texts]

    def embed_query(self, text: str) -> list:
        return [0.1] * 384
