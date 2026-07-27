from app.agents.state import AgentState
from app.llm.gemini import get_gemini_chat_model


def reflection_node(state: AgentState) -> AgentState:
    """
    Reflection Agent Node: Evaluates whether the generated response is sufficiently
    supported by retrieved document evidence, detecting hallucinations or missing details.
    """
    if state.route == "direct":
        state.is_sufficient = True
        state.add_reflection(
            step="Reflection Agent",
            is_sufficient=True,
            confidence_score=100.0,
            reason="Direct conversation route; reflection verification skipped."
        )
        return state

    if not state.documents or not state.generation.strip():
        state.is_sufficient = False
        state.add_reflection(
            step="Reflection Agent",
            is_sufficient=False,
            confidence_score=15.0,
            reason="No documents retrieved or answer generation was empty."
        )
        state.add_log(
            step="Reflection Agent",
            action="Insufficiency Detected",
            detail="Reflection agent flagged retrieved context as insufficient for factual grounding."
        )
        return state

    # Evaluate context coverage & text grounding
    doc_text_combined = " ".join([d.get("text", "") for d in state.documents]).lower()
    query_terms = [w.lower() for w in state.query.split() if len(w) > 3]

    matched_terms = [t for t in query_terms if t in doc_text_combined]
    term_coverage = len(matched_terms) / len(query_terms) if query_terms else 1.0

    # Calculate average retrieval relevance
    scores = [d.get("rerank_score", 0.0) for d in state.documents]
    avg_score = (sum(scores) / len(scores)) if scores else 0.0

    # Strict Reflection Decision
    if term_coverage < 0.4 and state.retry_count < state.max_retries:
        state.is_sufficient = False
        reason = f"Low query term coverage ({term_coverage:.0%}) in retrieved sources."
    elif avg_score < 0.2 and state.retry_count < state.max_retries:
        state.is_sufficient = False
        reason = f"Low document relevance score ({avg_score:.2f})."
    else:
        state.is_sufficient = True
        reason = "Answer is factually grounded and supported by retrieved evidence."

    state.add_reflection(
        step="Reflection Agent",
        is_sufficient=state.is_sufficient,
        confidence_score=min(100.0, max(20.0, (term_coverage * 50.0) + (avg_score * 50.0))),
        reason=reason
    )

    state.add_log(
        step="Reflection Agent",
        action="Answer Reflection Evaluation",
        detail=f"Sufficient: {state.is_sufficient} | Reason: {reason}"
    )

    return state
