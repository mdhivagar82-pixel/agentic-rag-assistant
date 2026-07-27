from app.agents.state import AgentState


def confidence_node(state: AgentState) -> AgentState:
    """
    Confidence Scoring & Hallucination Guard Node:
    Computes final confidence score (0-100%) and enforces Hallucination Guard
    if evidence remains insufficient.
    """
    if state.route == "direct":
        state.confidence_score = 100.0
        return state

    if not state.documents:
        state.confidence_score = 0.0
        state.generation = (
            f"There is not enough information in the indexed knowledge base documents to answer your question: **'{state.query}'**."
        )
        state.add_log(
            step="Confidence Node & Hallucination Guard",
            action="Hallucination Guard Triggered",
            detail="Zero documents found in knowledge base; enforced safe fallback response."
        )
        return state

    # Compute overall confidence score based on citations and retrieval scores
    if state.citations:
        citation_scores = [c.relevance_score for c in state.citations]
        avg_citation_score = sum(citation_scores) / len(citation_scores)
        computed_score = min(100.0, max(25.0, avg_citation_score * 100.0))
    else:
        computed_score = 40.0

    # Adjust for retries penalty if query was rewritten
    if state.retry_count > 0:
        computed_score = max(30.0, computed_score - (state.retry_count * 10.0))

    state.confidence_score = round(computed_score, 1)

    # Hallucination Guard check
    if not state.is_sufficient and state.retry_count >= state.max_retries:
        state.generation = (
            f"There is insufficient factual evidence in the indexed documents to confidently answer **'{state.query}'**. "
            "Please upload additional relevant documents to expand your knowledge base."
        )
        state.confidence_score = 25.0
        state.add_log(
            step="Confidence Node & Hallucination Guard",
            action="Hallucination Guard Triggered",
            detail="Reflection remained insufficient after max retries; guarded against hallucinated output."
        )

    state.add_log(
        step="Confidence Node",
        action="Final Score Calculated",
        detail=f"Assigned final response confidence score of {state.confidence_score}%."
    )

    return state
