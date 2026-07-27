import re
from app.agents.state import AgentState


def self_rag_node(state: AgentState) -> AgentState:
    """
    Self-RAG Node: Triggered when Reflection Agent flags response as insufficient.
    Reformulates query keywords and prepares state for next retrieval iteration.
    """
    state.retry_count += 1

    # Query Reformulation Logic
    raw = state.query.strip()
    words = [w for w in re.findall(r"\b\w+\b", raw) if len(w) > 2]
    
    if len(words) > 1:
        # Re-order and expand with domain keywords
        rewritten = " ".join(words[::-1]) + " overview details"
    else:
        rewritten = f"{raw} technical context specifications"

    state.rewrite_query = rewritten
    state.query = rewritten

    state.add_log(
        step="Self-RAG Node",
        action="Query Reformulation & Retry Triggered",
        detail=f"Iteration {state.retry_count}/{state.max_retries}: Reformulated query to '{rewritten}' for secondary retrieval."
    )

    return state
