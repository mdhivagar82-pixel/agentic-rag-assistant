import time
import hashlib
from typing import Dict, Any, Optional, Tuple


class InMemoryTTLCache:
    """
    In-memory TTL Cache for performance optimization of repeated retrieval queries.
    """

    def __init__(self, default_ttl_seconds: int = 300):
        self.default_ttl = default_ttl_seconds
        self._cache: Dict[str, Tuple[Any, float]] = {}
        self.hits: int = 0
        self.misses: int = 0

    def get(self, key: str) -> Optional[Any]:
        hashed_key = self._hash_key(key)
        if hashed_key in self._cache:
            data, expire_at = self._cache[hashed_key]
            if time.time() < expire_at:
                self.hits += 1
                return data
            else:
                # Expired entry
                del self._cache[hashed_key]

        self.misses += 1
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        hashed_key = self._hash_key(key)
        ttl_seconds = ttl if ttl is not None else self.default_ttl
        expire_at = time.time() + ttl_seconds
        self._cache[hashed_key] = (value, expire_at)

    def get_stats(self) -> Dict[str, Any]:
        total = self.hits + self.misses
        hit_rate = round((self.hits / total) * 100, 1) if total > 0 else 0.0
        return {
            "cached_entries": len(self._cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate_percent": hit_rate
        }

    @staticmethod
    def _hash_key(key: str) -> str:
        return hashlib.sha256(key.strip().lower().encode("utf-8")).hexdigest()


# Global singleton instance
retrieval_cache = InMemoryTTLCache(default_ttl_seconds=600)
