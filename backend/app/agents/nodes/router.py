import time
from app.agents.state import AgentState


def router_node(state: AgentState) -> AgentState:
    """
    Router Node: Classifies query intent to route to Vector Store,
    Web Tool, or Direct Answer.
    """
    start_time = time.time()
    query_lower = state.user_query.lower().strip()

    casual_greetings = ["hi", "hello", "hey", "who are you", "what can you do", "good morning", "good evening"]
    if any(query_lower == g or query_lower.startswith(g + " ") for g in casual_greetings):
        state.intent = "direct_answer"
    else:
        state.intent = "vector_search"

    duration = (time.time() - start_time) * 1000

    state.add_thought(
        agent_name="Router Agent",
        action="Intent Classification",
        detail=f"Classified intent as '{state.intent}' based on query semantics.",
        duration_ms=duration,
    )

    return state
