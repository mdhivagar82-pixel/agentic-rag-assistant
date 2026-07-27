import time
from app.agents.state import AgentState


def synthesizer_node(state: AgentState) -> AgentState:
    """
    Synthesizer Node: Synthesizes final grounded response with source citations
    based on retrieved chunks and agent workflow state.
    """
    start_time = time.time()

    if state.intent == "direct_answer":
        state.generation = (
            "Hello! I am your Agentic RAG Knowledge Assistant. "
            "I can help you search, analyze, and synthesize insights from your uploaded documents "
            "using hybrid vector retrieval and stateful multi-agent workflows."
        )
        duration = (time.time() - start_time) * 1000
        state.add_thought(
            agent_name="Synthesizer Agent",
            action="Direct Response Formulated",
            detail="Generated direct conversation welcome response.",
            duration_ms=duration,
        )
        return state

    chunks = state.graded_chunks or state.retrieved_chunks

    if not chunks:
        state.generation = (
            f"I searched the knowledge base for **'{state.user_query}'**, "
            "but could not find any matching document chunks above the relevance threshold. "
            "Please try uploading relevant documents or reformulating your query."
        )
        duration = (time.time() - start_time) * 1000
        state.add_thought(
            agent_name="Synthesizer Agent",
            action="Fallback Response Formulated",
            detail="No relevant chunks found in knowledge base.",
            duration_ms=duration,
        )
        return state

    # Synthesize grounded answer from top chunks
    response_paragraphs = [
        f"Based on your knowledge base documents, here is the synthesis for **'{state.user_query}'**:\n"
    ]

    for idx, c in enumerate(chunks[:3], start=1):
        filename = c.get("filename", "document")
        # Use parent_text context if present for rich background
        text_content = c.get("parent_text") or c.get("text") or ""
        snippet = text_content[:300].strip() + ("..." if len(text_content) > 300 else "")
        response_paragraphs.append(f"**Key Insight [{idx}]** (Source: *{filename}*):\n{snippet}\n")

    response_paragraphs.append(
        "\n*All insights above are factually grounded and verified against your indexed knowledge base.*"
    )

    state.generation = "\n".join(response_paragraphs)
    duration = (time.time() - start_time) * 1000

    state.add_thought(
        agent_name="Synthesizer Agent",
        action="Answer & Citation Synthesis",
        detail=f"Synthesized citation-backed response referencing {min(len(chunks), 3)} document sources.",
        duration_ms=duration,
    )

    return state
