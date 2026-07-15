# # ─────────────────────────────────────────────
# # routes/writing.py
# # FastAPI Routes — Writing Module
# # ─────────────────────────────────────────────

# from fastapi import APIRouter, HTTPException
# from loguru import logger

# from agents.writing_agent import WritingEvaluationAgent
# from schemas.writing_schema import (
#     WritingEvaluationRequest,
#     WritingEvaluationResponse,
# )

# router = APIRouter()

# # Single agent instance (reused across requests)
# agent = WritingEvaluationAgent()


# # ── POST /api/writing/evaluate ──────────────────

# @router.post("/evaluate", response_model=WritingEvaluationResponse)
# async def evaluate_writing(request: WritingEvaluationRequest):
#     """
#     Evaluate a complete IELTS Writing test.

#     Receives Task 1 + Task 2 responses,
#     runs them through the evaluation agent,
#     returns full band scores + feedback.
#     """
#     logger.info(
#         f"Evaluation request — Type: {request.test_type} | "
#         f"T1 words: ~{len(request.task1_response.split())} | "
#         f"T2 words: ~{len(request.task2_response.split())}"
#     )

#     try:
#         result = await agent.evaluate(request)
#         logger.success(
#             f"Evaluation complete — Overall Band: {result.overall_writing_band}"
#         )
#         return result

#     except ValueError as e:
#         logger.error(f"Evaluation error: {e}")
#         raise HTTPException(status_code=422, detail=str(e))

#     except Exception as e:
#         logger.error(f"Unexpected error: {e}")
#         raise HTTPException(
#             status_code=500,
#             detail="Evaluation failed. Please try again."
#         )


# # ── GET /api/writing/health ─────────────────────

# @router.get("/health")
# async def writing_health():
#     """Quick health check for writing module."""
#     return {"status": "ok", "module": "writing"}



































# ─────────────────────────────────────────────
# routes/writing.py
# FastAPI Routes — Writing Module
# ─────────────────────────────────────────────

from fastapi import APIRouter, HTTPException
from loguru import logger

from agents.writing_agent import WritingEvaluationAgent, RateLimitExceededError
from schemas.writing_schema import (
    WritingEvaluationRequest,
    WritingEvaluationResponse,
)

router = APIRouter()

# Single agent instance (reused across requests)
agent = WritingEvaluationAgent()


# ── POST /api/writing/evaluate ──────────────────

@router.post("/evaluate", response_model=WritingEvaluationResponse)
async def evaluate_writing(request: WritingEvaluationRequest):
    """
    Evaluate a complete IELTS Writing test.

    Receives Task 1 + Task 2 responses,
    runs them through the evaluation agent,
    returns full band scores + feedback.
    """
    logger.info(
        f"Evaluation request — Type: {request.test_type} | "
        f"T1 words: ~{len(request.task1_response.split())} | "
        f"T2 words: ~{len(request.task2_response.split())}"
    )

    try:
        result = await agent.evaluate(request)
        logger.success(
            f"Evaluation complete — Overall Band: {result.overall_writing_band}"
        )
        return result

    except RateLimitExceededError as e:
        # Distinct from a generic server error — tell the user this is
        # temporary and to just retry shortly, not that something broke.
        logger.error(f"Rate limit exceeded: {e}")
        raise HTTPException(status_code=503, detail=str(e))

    except ValueError as e:
        logger.error(f"Evaluation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Evaluation failed. Please try again."
        )


# ── GET /api/writing/health ─────────────────────

@router.get("/health")
async def writing_health():
    """Quick health check for writing module."""
    return {"status": "ok", "module": "writing"}