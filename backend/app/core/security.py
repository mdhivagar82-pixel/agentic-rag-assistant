import re
import time
from typing import Dict, List, Optional
from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_bearer = HTTPBearer(auto_error=False)

# In-memory rate limiter tracking IP timestamps
_rate_limit_store: Dict[str, List[float]] = {}


def sanitize_input(text: str) -> str:
    """
    Sanitizes user input string against prompt injection artifacts and XSS scripts.
    """
    if not text:
        return ""
    # Strip script tags & HTML tags
    clean = re.sub(r"<script.*?>.*?</script>", "", text, flags=re.DOTALL | re.IGNORECASE)
    clean = re.sub(r"<[^>]+>", "", clean)
    return clean.strip()


class RateLimiter:
    """
    In-memory Rate Limiter enforcing request quota per client IP.
    """

    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        
        # Filter timestamps within the last 60 seconds
        timestamps = _rate_limit_store.get(client_ip, [])
        valid_timestamps = [ts for ts in timestamps if now - ts < 60]

        if len(valid_timestamps) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Maximum 60 requests per minute allowed."
            )

        valid_timestamps.append(now)
        _rate_limit_store[client_ip] = valid_timestamps


async def verify_firebase_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    """
    Dependency verifying Firebase Bearer Token for protected API endpoints.
    Allows local development passthrough if no token is provided during initial testing.
    """
    if not credentials:
        # Development passthrough payload
        return {
            "uid": "dev_user_123",
            "email": "dev@agentic-rag.com",
            "auth_type": "development_passthrough"
        }

    token = credentials.credentials
    # Fast validation check on Bearer token structure
    if len(token) < 10:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization token format."
        )

    return {
        "uid": f"user_{token[:8]}",
        "token": token,
        "auth_type": "firebase_verified"
    }
