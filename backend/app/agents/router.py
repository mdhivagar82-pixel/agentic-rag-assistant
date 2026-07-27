from app.agents.state import AgentState


def query_router_node(state: AgentState) -> AgentState:
    """
    Query Router Node: Analyzes query intent to route between
    hybrid retrieval pipeline or direct response.
    """
    query_lower = state.query.lower().strip()
    
    casual_greetings = ["hi", "hello", "hey", "who are you", "what can you do", "good morning", "good evening"]
    
    if any(query_lower == g or query_lower.startswith(g + " ") for g in casual_greetings):
        state.route = "direct"
        state.add_log(
            step="Query Router",
            action="Route to Direct Answer",
            detail="Casual greeting or general question detected; bypassing retrieval."
        )
    else:
        state.route = "retrieve"
        state.add_log(
            step="Query Router",
            action="Route to Hybrid Retrieval",
            detail="Knowledge domain query detected; routing to Hybrid Retriever."
        )

    return state
