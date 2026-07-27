from typing import Dict, Any
from app.agents.state import AgentState
from app.agents.router import query_router_node
from app.agents.nodes import retrieval_agent_node, context_formatter_node, answer_generator_node
from app.agents.reflection_node import reflection_node
from app.agents.confidence_node import confidence_node
from app.agents.self_rag_node import self_rag_node

# Import LangGraph StateGraph if installed
try:
    from langgraph.graph import StateGraph, END
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False


class LangGraphWorkflowEngine:
    """
    LangGraph Workflow Engine orchestrating multi-agent state graph with Self-RAG reflection loops:
    
    [Router]
       │
       ▼
    [Retriever] ◄────────┐
       │                 │
       ▼                 │
    [Context Formatter]  │
       │                 │
       ▼                 │
    [Answer Generator]   │
       │                 │
       ▼                 │
    [Reflection]         │
       │                 │
       ├──── No ──► [Self-RAG Node]
       │
      Yes
       │
       ▼
    [Confidence Node] ──► [END]
    """

    def __init__(self):
        self.graph = None
        if HAS_LANGGRAPH:
            self._build_langgraph()

    def _build_langgraph(self):
        builder = StateGraph(AgentState)

        # Add Nodes
        builder.add_node("query_router", query_router_node)
        builder.add_node("retrieval_agent", retrieval_agent_node)
        builder.add_node("context_formatter", context_formatter_node)
        builder.add_node("answer_generator", answer_generator_node)
        builder.add_node("reflection_agent", reflection_node)
        builder.add_node("self_rag_node", self_rag_node)
        builder.add_node("confidence_node", confidence_node)

        # Set Entry Point
        builder.set_entry_point("query_router")

        # Static Edges
        builder.add_edge("query_router", "retrieval_agent")
        builder.add_edge("retrieval_agent", "context_formatter")
        builder.add_edge("context_formatter", "answer_generator")
        builder.add_edge("answer_generator", "reflection_agent")

        # Conditional Reflection Loop Edge
        def decide_to_retry(state: AgentState) -> str:
            if state.route == "direct" or state.is_sufficient or state.retry_count >= state.max_retries:
                return "confidence_node"
            return "self_rag_node"

        builder.add_conditional_edges(
            "reflection_agent",
            decide_to_retry,
            {
                "confidence_node": "confidence_node",
                "self_rag_node": "self_rag_node"
            }
        )

        builder.add_edge("self_rag_node", "retrieval_agent")
        builder.add_edge("confidence_node", END)

        self.graph = builder.compile()

    def run(self, query: str) -> AgentState:
        initial_state = AgentState(query=query)

        if HAS_LANGGRAPH and self.graph:
            final_output = self.graph.invoke(initial_state)
            if isinstance(final_output, dict):
                return AgentState(**final_output)
            return final_output
        else:
            # Deterministic fallback loop execution
            state = query_router_node(initial_state)
            
            while True:
                state = retrieval_agent_node(state)
                state = context_formatter_node(state)
                state = answer_generator_node(state)
                state = reflection_node(state)

                if state.route == "direct" or state.is_sufficient or state.retry_count >= state.max_retries:
                    break

                state = self_rag_node(state)

            state = confidence_node(state)
            return state


# Global workflow engine instances
langgraph_engine = LangGraphWorkflowEngine()
agent_workflow = langgraph_engine
