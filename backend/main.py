# # ─────────────────────────────────────────────
# # AI-IELTS Backend — FastAPI Entry Point
# # Run: uvicorn main:app --reload --port 8000
# # ─────────────────────────────────────────────

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager
# from loguru import logger

# from routes.writing import router as writing_router
# from core.config import settings


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     logger.info("🚀 AI-IELTS Backend starting...")
#     yield
#     logger.info("🛑 AI-IELTS Backend shutting down...")


# app = FastAPI(
#     title="AI-IELTS Backend",
#     description="IELTS Writing Module — Agent-powered evaluation API",
#     version="1.0.0",
#     lifespan=lifespan,
# )

# # ── CORS — Allow Next.js frontend to call this API ──
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.ALLOWED_ORIGINS,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ── Routers ──
# app.include_router(writing_router, prefix="/api/writing", tags=["Writing Module"])


# @app.get("/health")
# async def health_check():
#     return {"status": "ok", "service": "AI-IELTS Backend"}











# main.py — FastAPI Entry Point
# Run: python -m uvicorn main:app --reload --port 8000

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from routes.writing import router as writing_router
from routes.questions import router as questions_router
from routes.reading import router as reading_router
from routes.listening import router as listening_router
from core.config import settings
from routes.speaking_ws import router as speaking_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AI-IELTS Backend starting...")
    yield
    logger.info("🛑 AI-IELTS Backend shutting down...")


app = FastAPI(
    title="AI-IELTS Backend",
    description="IELTS Writing, Speaking & Reading Module API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
     allow_origin_regex=r"https://.*\.vercel\.app", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(writing_router,   prefix="/api/writing",   tags=["Writing Evaluation"])
app.include_router(questions_router, prefix="/api/questions", tags=["Question Generator"])
app.include_router(reading_router,   prefix="/api/reading",   tags=["Reading Module"])
app.include_router(listening_router, prefix="/api/listening", tags=["Listening Module"])
app.include_router(speaking_router)



@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "AI-IELTS Backend"}