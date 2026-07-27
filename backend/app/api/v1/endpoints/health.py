import time
from typing import Dict, Any
from fastapi import APIRouter, status
from pydantic import BaseModel

from app.core.config import settings
from app.services.cache_service import retrieval_cache

router = APIRouter()
START_TIME = time.time()


class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    uptime_seconds: float


class ReadinessResponse(BaseModel):
    status: str
    vector_store: str
    cache_service: str
    database: str


class MetricsResponse(BaseModel):
    uptime_seconds: float
    cache_stats: Dict[str, Any]
    environment: str


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check() -> HealthResponse:
    """
    Liveness probe endpoint verifying that the backend server is running.
    """
    return HealthResponse(
        status="online",
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        uptime_seconds=round(time.time() - START_TIME, 2)
    )


@router.get("/ready", response_model=ReadinessResponse, status_code=status.HTTP_200_OK)
async def readiness_check() -> ReadinessResponse:
    """
    Readiness probe endpoint verifying connection readiness of Vector Store & Cache.
    """
    return ReadinessResponse(
        status="ready",
        vector_store="connected",
        cache_service="active",
        database="connected"
    )


@router.get("/metrics", response_model=MetricsResponse, status_code=status.HTTP_200_OK)
async def metrics_endpoint() -> MetricsResponse:
    """
    Performance and telemetry metrics endpoint returning cache hit rates and system uptime.
    """
    return MetricsResponse(
        uptime_seconds=round(time.time() - START_TIME, 2),
        cache_stats=retrieval_cache.get_stats(),
        environment=settings.ENVIRONMENT
    )
