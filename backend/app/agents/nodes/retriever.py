import time
from app.agents.state import AgentState
from app.services.hybrid_search import hybrid_engine


def retriever_node(state: AgentState) -> AgentState:
    """
    Retriever Node: Calls Hybrid Search Engine (Dense Vector + BM25 + RRF)
    and populates retrieved candidate chunks into agent state.
    """
    start_time = time.time()
    search_query = state.transformed_query or state.user_query

    if state.intent == "direct_answer":
        state.retrieved_chunks = []
        state.graded_chunks = []
        duration = (time.time() - start_time) * 1000
        state.add_thought(
            agent_name="Retriever Agent",
            action="Bypass Retrieval",
            detail="Direct answer intent detected; skipping vector database search.",
            duration_ms=duration,
        )
        return state

    # Execute Hybrid Retrieval Engine
    results = hybrid_engine.search(query=search_query, top_k=5)

    retrieved_list = [r.model_dump() for r in results]
    state.retrieved_chunks = retrieved_list
    state.graded_chunks = retrieved_list

    avg_score = (
        sum(r.rerank_score for r in results) / len(results) if results else 0.0
    )
    state.relevance_score = round(avg_score, 4)

    duration = (time.time() - start_time) * 1000

    state.add_thought(
        agent_name="Retriever Agent",
        action="Hybrid Retrieval & RRF Fusion",
        detail=f"Retrieved {len(results)} relevant chunks with average rerank relevance score of {avg_score:.2f}",
        duration_ms=duration,
    )

    return state
