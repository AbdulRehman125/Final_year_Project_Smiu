# core/dynamic_settings.py
# Dynamic Settings Manager for FastAPI Backend
# Fetches live settings from Prisma DB via Next.js API with TTL caching and .env fallback.

import time
import httpx
from typing import Dict, Any, Optional
from loguru import logger
from langchain_groq import ChatGroq
from groq import Groq
from core.config import settings

_settings_cache: Dict[str, Any] = {}
_last_fetch_time: float = 0
CACHE_TTL_SECONDS: float = 30.0  # 30 seconds cache for high performance & fast updates


def fetch_live_settings(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Fetch the latest settings from the Next.js internal endpoint.
    Uses in-memory TTL caching to avoid frequent network overhead.
    """
    global _settings_cache, _last_fetch_time

    current_time = time.time()
    if not force_refresh and (current_time - _last_fetch_time < CACHE_TTL_SECONDS):
        return _settings_cache

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    endpoint = f"{frontend_url.rstrip('/')}/api/settings/internal"

    try:
        with httpx.Client(timeout=3.0) as client:
            resp = client.get(endpoint)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("success") and "settings" in data:
                    _settings_cache = data["settings"]
                    _last_fetch_time = current_time
                    logger.debug("Successfully refreshed dynamic settings from database.")
                    return _settings_cache
    except Exception as e:
        logger.warning(f"Could not fetch dynamic settings from {endpoint} ({e}). Falling back to .env.")

    # Return empty or previous cache so getters fall back to .env
    return _settings_cache


def get_groq_api_key() -> str:
    """Returns DB key if present and non-empty, otherwise falls back to backend .env GROQ_API_KEY"""
    live = fetch_live_settings()
    key = live.get("GROQ_API_KEY")
    if key and isinstance(key, str) and key.strip():
        return key.strip()
    return getattr(settings, "GROQ_API_KEY", "")


def get_llm_model(default_override: Optional[str] = None) -> str:
    """Returns DB model if present and non-empty, otherwise falls back to backend .env LLM_MODEL"""
    if default_override and default_override.strip():
        return default_override.strip()
    live = fetch_live_settings()
    model = live.get("LLM_MODEL")
    if model and isinstance(model, str) and model.strip():
        return model.strip()
    return getattr(settings, "LLM_MODEL", "openai/gpt-oss-120bs")


def get_llm_max_tokens(default_override: Optional[int] = None) -> int:
    """Returns DB max_tokens if present, otherwise falls back to backend .env LLM_MAX_TOKENS"""
    if default_override is not None:
        return default_override
    live = fetch_live_settings()
    val = live.get("LLM_MAX_TOKENS")
    # if val and str(val).strip():
    #     try:
    #         return int(val)
    #     except (ValueError, TypeError):
    if val is not None and str(val).strip() != "":
        try:
            return int(val)
        except (ValueError, TypeError):
            pass
    return getattr(settings, "LLM_MAX_TOKENS", 2000)


# def get_llm_temperature(default_override: Optional[float] = None) -> float:
#     """Returns DB temperature if present, otherwise falls back to backend .env LLM_TEMPERATURE"""
#     if default_override is not None:
#         return default_override
#     live = fetch_live_settings()
#     val = live.get("LLM_TEMPERATURE")
#     if val and str(val).strip():
#         try:
#             return float(val)
#         except (ValueError, TypeError):
#             pass
#     return getattr(settings, "LLM_TEMPERATURE", 0.2)


def get_llm_temperature(default_override: Optional[float] = None) -> float:
    if default_override is not None:
        return default_override
    live = fetch_live_settings()
    val = live.get("LLM_TEMPERATURE")
    if val is not None and str(val).strip() != "":
        try:
            return float(val)
        except (ValueError, TypeError):
            pass
    return getattr(settings, "LLM_TEMPERATURE", 0.2)

def get_chat_groq(
    model: Optional[str] = None,
    max_tokens: Optional[int] = None,
    temperature: Optional[float] = None,
) -> ChatGroq:
    """
    Returns a freshly configured ChatGroq instance using dynamic DB settings with .env fallback.
    """
    api_key = get_groq_api_key()
    selected_model = get_llm_model(model)
    selected_tokens = get_llm_max_tokens(max_tokens)
    selected_temp = get_llm_temperature(temperature)

    return ChatGroq(
        model=selected_model,
        groq_api_key=api_key,
        max_tokens=selected_tokens,
        temperature=selected_temp,
    )


def get_raw_groq_client() -> Groq:
    """
    Returns a freshly configured Groq SDK client using dynamic DB settings with .env fallback.
    """
    api_key = get_groq_api_key()
    return Groq(api_key=api_key)
