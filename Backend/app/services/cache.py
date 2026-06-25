import redis
import json
import os
from typing import Any, Optional
from app.core.config import settings

REDIS_HOST = os.getenv("REDIS_HOST", settings.POSTGRES_SERVER) # Assuming redis is on same host or as defined in compose
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_DB = int(os.getenv("REDIS_DB", 0))

redis_client = None
try:
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        decode_responses=True,
        socket_connect_timeout=1
    )
    # Ping to check if actually available
    redis_client.ping()
except Exception as e:
    print(f"Warning: Redis not available, caching will be disabled: {e}")
    redis_client = None

def get_cache(key: str) -> Optional[Any]:
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception as e:
        print(f"Redis get error: {e}")
    return None

def set_cache(key: str, value: Any, expire: int = 3600):
    if not redis_client:
        return
    try:
        redis_client.setex(
            key,
            expire,
            json.dumps(value)
        )
    except Exception as e:
        print(f"Redis set error: {e}")

def delete_cache(key: str):
    if not redis_client:
        return
    try:
        redis_client.delete(key)
    except Exception as e:
        print(f"Redis delete error: {e}")
