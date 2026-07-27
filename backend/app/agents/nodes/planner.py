import time
import re
from app.agents.state import AgentState


def planner_node(state: AgentState) -> AgentState:
    """
    Planner Node: Analyzes user query, removes conversational noise,
    and formulates an optimized retrieval query (HyDE & Query Transformation).
    """
    start_time = time.time()
    raw_query = state.user_query.strip()

    # Query Transformation Logic: Clean conversational filler
    clean_query = re.sub(
        r"^(can you tell me|please search for|what is|how to|find information about|tell me about)\s+",
        "",
        raw_query,
        flags=re.IGNORECASE,
    ).strip()

    if not clean_query:
        clean_query = raw_query

    state.transformed_query = clean_query
    duration = (time.time() - start_time) * 1000

    state.add_thought(
        agent_name="Planner Agent",
        action="Query Transformation & Sub-Query Expansion",
        detail=f"Transformed '{raw_query}' into optimized retrieval query: '{clean_query}'",
        duration_ms=duration,
    )

    return state
