from typing import List, Dict, Any
from app.agents.state import AgentState, CitationItem
from app.services.hybrid_search import hybrid_engine
from app.llm.gemini import get_gemini_chat_model


def retrieval_agent_node(state: AgentState) -> AgentState:
    """
    Retrieval Agent: Executes Hybrid Retrieval across Qdrant Vector Store and BM25 index.
    """
    if state.route == "direct":
        state.documents = []
        return state

    results = hybrid_engine.search(query=state.query, top_k=5)
    doc_list = [r.model_dump() for r in results]
    state.documents = doc_list

    state.add_log(
        step="Retrieval Agent",
        action="Hybrid Vector + BM25 Search",
        detail=f"Retrieved {len(doc_list)} candidate document chunks from Qdrant vector store and BM25 index."
    )
    return state


def context_formatter_node(state: AgentState) -> AgentState:
    """
    Context Formatter: Formats retrieved chunks into structured context block
    with inline citation tags.
    """
    if not state.documents:
        state.formatted_context = "No document context available."
        state.citations = []
        return state

    formatted_blocks: List[str] = []
    citations: List[CitationItem] = []

    for idx, doc in enumerate(state.documents[:4], start=1):
        filename = doc.get("filename", "unknown_source")
        chunk_id = doc.get("chunk_id", "chunk_0")
        text = doc.get("parent_text") or doc.get("text") or ""
        score = doc.get("rerank_score", 0.0)

        block = f"[Source {idx}: {filename} | Chunk: {chunk_id}]\n{text.strip()}"
        formatted_blocks.append(block)

        citations.append(
            CitationItem(
                citation_id=idx,
                source_filename=filename,
                chunk_id=chunk_id,
                snippet=text[:200].strip() + ("..." if len(text) > 200 else ""),
                relevance_score=score
            )
        )

    state.formatted_context = "\n\n---\n\n".join(formatted_blocks)
    state.citations = citations

    state.add_log(
        step="Context Formatter & Citation Generator",
        action="Context Assembly",
        detail=f"Formatted {len(citations)} source blocks and generated explicit citation markers."
    )
    return state


def answer_generator_node(state: AgentState) -> AgentState:
    """
    Answer Generation Agent: Uses Google Gemini Chat model to generate
    factual response grounded strictly in retrieved context.
    """
    if state.route == "direct":
        state.generation = (
            "Hello! I am your Agentic RAG Knowledge Assistant powered by Google Gemini and LangGraph. "
            "Ask me any question about your uploaded knowledge base documents."
        )
        return state

    if not state.documents:
        state.generation = (
            f"I searched your indexed knowledge base for **'{state.query}'**, "
            "but no relevant document chunks were found. Please upload matching documents to get a grounded answer."
        )
        return state

    # Prompt forcing strict grounding and document citations
    prompt = f"""You are a precise, factual AI Knowledge Assistant.
Answer the user's question STRICTLY based on the provided document context below.
Do NOT invent information or draw on outside knowledge not present in the context.
Include explicit inline citations like [Source 1], [Source 2] matching the source tags whenever referencing facts.

User Question: {state.query}

Document Context:
{state.formatted_context}

Grounded Answer (with inline citations):"""

    try:
        llm = get_gemini_chat_model(temperature=0.1)
        response = llm.invoke(prompt)

        # Handle string response vs LangChain BaseMessage
        if hasattr(response, "content"):
            state.generation = str(response.content)
        else:
            state.generation = str(response)
    except Exception as e:
        state.generation = f"Grounded response based on retrieved sources:\n\n{state.formatted_context[:500]}...\n\n*(Note: LLM invocation notice: {str(e)})*"

    state.add_log(
        step="Answer Generation Agent",
        action="Gemini LLM Synthesis",
        detail="Synthesized grounded answer strictly using retrieved document context."
    )
    return state
