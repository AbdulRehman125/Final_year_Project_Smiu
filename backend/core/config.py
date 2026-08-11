# # core/config.py — Environment & App Settings

# from pydantic_settings import BaseSettings
# from typing import List


# class Settings(BaseSettings):
#     # Groq API Key (free at console.groq.com)
#     GROQ_API_KEY: str

#     # App
#     APP_ENV: str = "development"
#     APP_PORT: int = 8000

#     # CORS
#     ALLOWED_ORIGINS: List[str] = [
#         "http://localhost:3000",
#         "http://localhost:3001",
#     ]

#     # LLM Model — Groq free models
#     # Options: "llama-3.3-70b-versatile" | "llama3-70b-8192" | "mixtral-8x7b-32768"
#     LLM_MODEL: str = "llama-3.3-70b-versatile"
#     LLM_MAX_TOKENS: int = 4096
#     LLM_TEMPERATURE: float = 0.2

#     class Config:
#         env_file = ".env"
#         env_file_encoding = "utf-8"
#         extra = "ignore"


# settings = Settings()
















# # core/config.py

# from pydantic_settings import BaseSettings
# from typing import List


# class Settings(BaseSettings):
#     GROQ_API_KEY: str

#     APP_ENV: str = "development"
#     APP_PORT: int = 8000

#     # Frontend URL — backend calls this to fetch DB images
#     FRONTEND_URL: str = "http://localhost:3000"

#     ALLOWED_ORIGINS: List[str] = [
#         "http://localhost:3000",
#         "http://localhost:3001",
#     ]

#     LLM_MODEL: str = "llama-3.3-70b-versatile"
#     LLM_MAX_TOKENS: int = 4096
#     LLM_TEMPERATURE: float = 0.2

#     class Config:
#         env_file = ".env"
#         env_file_encoding = "utf-8"
#         extra = "ignore"


# settings = Settings()



















# # core/config.py — Environment & App Settings

# from pydantic_settings import BaseSettings
# from typing import List


# class Settings(BaseSettings):
#     # Groq API Key (free at console.groq.com)
#     GROQ_API_KEY: str

#     # App
#     APP_ENV: str = "development"
#     APP_PORT: int = 8000

#     # CORS
#     ALLOWED_ORIGINS: List[str] = [
#         "http://localhost:3000",
#         "http://localhost:3001",
#     ]

#     # LLM Model — Groq free models
#     # Options: "llama-3.3-70b-versatile" | "llama3-70b-8192" | "mixtral-8x7b-32768"
#     LLM_MODEL: str = "llama-3.3-70b-versatile"
#     LLM_MAX_TOKENS: int = 4096
#     LLM_TEMPERATURE: float = 0.2

#     class Config:
#         env_file = ".env"
#         env_file_encoding = "utf-8"
#         extra = "ignore"


# settings = Settings()
















# core/config.py

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    GROQ_API_KEY: str

    APP_ENV: str = "development"
    APP_PORT: int = 8000

    # Frontend URL — backend calls this to fetch DB images
    FRONTEND_URL: str = "http://localhost:3000"

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    LLM_MODEL: str = "llama-3.3-70b-versatile"
    LLM_MAX_TOKENS: int = 2000
    LLM_READING_MAX_TOKENS: int = 8192
    LLM_LISTENING_MAX_TOKENS: int = 1950
    LLM_TEMPERATURE: float = 0.2

    CLOUDINARY_CLOUD_NAME: str = "dbb2jbpt8"
    CLOUDINARY_API_KEY: str = "633737442915154"
    CLOUDINARY_API_SECRET: str = "XjY9o2bXJfyFEWE4fC5O793SG5s"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()