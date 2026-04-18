import os
import json
import hashlib
import redis
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Redis for Semantic Caching
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/1")
try:
    redis_client = redis.from_url(REDIS_URL, socket_connect_timeout=1)
    redis_client.ping()
    REDIS_AVAILABLE = True
except Exception:
    print("Redis not available. Semantic caching disabled.")
    redis_client = None
    REDIS_AVAILABLE = False

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

def compute_cache_key(prompt: str, context: str) -> str:
    hash_input = f"{prompt}|{context}".encode("utf-8")
    return hashlib.sha256(hash_input).hexdigest()

def get_cached_response(cache_key: str) -> str:
    if not REDIS_AVAILABLE:
        return None
    try:
        cached = redis_client.get(cache_key)
        if cached:
            return cached.decode("utf-8")
    except Exception as e:
        print(f"Redis cache read error: {e}")
    return None

def set_cached_response(cache_key: str, response: str, expire: int = 86400):
    if not REDIS_AVAILABLE:
        return
    try:
        redis_client.setex(cache_key, expire, response)
    except Exception as e:
        print(f"Redis cache write error: {e}")

def generate_llm_response(system_prompt: str, user_prompt: str, json_mode: bool = False) -> str:
    # 1. Check Cache (skip if json_mode as responses might need strict validation or distinct generation)
    cache_key = None
    if not json_mode:
        cache_key = compute_cache_key(user_prompt, system_prompt)
        cached = get_cached_response(cache_key)
        if cached:
            print("CACHE HIT")
            return cached
            
    print("CACHE MISS - Calling Groq API")
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    kwargs = {
        "messages": messages,
        "model": "llama-3.3-70b-versatile",
        "temperature": 0.3
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}
        kwargs["temperature"] = 0.1 # Lower temp for JSON consistency

    completion = groq_client.chat.completions.create(**kwargs)
    response_text = completion.choices[0].message.content
    
    if cache_key:
        set_cached_response(cache_key, response_text)
        
    return response_text
