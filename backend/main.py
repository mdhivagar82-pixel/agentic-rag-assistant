import time
import uuid
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.api.v1.router import api_router

# Setup Structured Logging
setup_logging(settings.LOG_LEVEL)
logger = get_logger("main")

# FastAPI App Instance with Rich OpenAPI Documentation
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Ready Agentic RAG Knowledge Assistant Microservice Engine.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# GZip Compression Middleware (Minimum size: 1000 bytes)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS Middleware - Support all client domains including Vercel & localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request ID, Performance Timing & Security Headers Middleware
@app.middleware("http")
async def add_security_and_telemetry_headers(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()

    response = await call_next(request)

    process_time = (time.time() - start_time) * 1000
    
    # Telemetry Headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.2f}ms"

    # Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    return response


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Exception caught: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected system error occurred.",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else "Refer to server logs."
        }
    )


# Root Navigation Endpoint
@app.get("/", tags=["Root"])
async def root_endpoint():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "metrics": f"{settings.API_V1_STR}/metrics"
    }


# Include V1 API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=True if settings.ENVIRONMENT == "development" else False
    )
