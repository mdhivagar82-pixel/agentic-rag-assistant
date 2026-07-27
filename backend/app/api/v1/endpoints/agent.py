from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.graph import agent_workflow
from app.agents.state import AgentState

router = APIRouter()


class AgentRunRequest(BaseModel):
    query: str


@router.post("/run", response_model=AgentState)
async def run_agent_workflow(request: AgentRunRequest) -> AgentState:
    """
    Execute LangGraph Multi-Agent Workflow:
    Executes Planner -> Router -> Retriever -> Synthesizer nodes
    and returns complete execution trace and synthesized response.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        final_state: AgentState = agent_workflow.run(request.query)
        return final_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent workflow execution error: {str(e)}")
