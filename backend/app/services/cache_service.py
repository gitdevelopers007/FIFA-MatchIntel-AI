import time
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class MemoryCache:
    """
    Lightweight, thread-safe, in-memory caching utility.
    Used to bypass SQLite read operations on hot endpoints.
    """
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(MemoryCache, cls).__new__(cls, *args, **kwargs)
            cls._instance.cache = {}
        return cls._instance

    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache if it has not expired."""
        if key in self.cache:
            entry = self.cache[key]
            if time.time() < entry["expires_at"]:
                logger.debug(f"Cache hit: {key}")
                return entry["value"]
            else:
                logger.debug(f"Cache expired: {key}")
                del self.cache[key]
        return None

    def set(self, key: str, value: Any, ttl: int = 5) -> None:
        """Store value in cache with a defined Time-To-Live (TTL) in seconds."""
        self.cache[key] = {
            "value": value,
            "expires_at": time.time() + ttl
        }
        logger.debug(f"Cached key: {key} (TTL: {ttl}s)")

    def invalidate(self, prefix: str) -> None:
        """Invalidate all cache entries starting with a specific prefix."""
        keys_to_delete = [k for k in self.cache.keys() if k.startswith(prefix)]
        for k in keys_to_delete:
            del self.cache[k]
            logger.debug(f"Cache invalidated: {k}")

    def clear(self) -> None:
        """Completely clear the cache."""
        self.cache.clear()
        logger.info("Memory cache cleared successfully.")

cache = MemoryCache()
