# backend/routes/reading.py — FastAPI endpoints for IELTS Reading module

from fastapi import APIRouter, HTTPException, status
from loguru import logger

from schemas.reading_schema import (
    ReadingTestGenerateResponse,
    ReadingSubmitRequest,
    ReadingSubmitResponse,
)
from agents.reading_agent import ReadingTestGeneratorAgent, ReadingScorer

router = APIRouter()


@router.get(
    "/generate",
    response_model=ReadingTestGenerateResponse,
    summary="Generate AI IELTS Reading Test",
    description="Generates a full 3-passage, 40-question IELTS Academic Reading test with diverse passage topics and question types.",
)
async def generate_reading_test():
    try:
        agent = ReadingTestGeneratorAgent()
        test_data = await agent.generate_test()
        return ReadingTestGenerateResponse(**test_data)
    except Exception as e:
        logger.error(f"Failed to generate reading test: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate reading test: {str(e)}",
        )


@router.post(
    "/evaluate",
    response_model=ReadingSubmitResponse,
    summary="Evaluate IELTS Reading Test Answers",
    description="Deterministically grades user answers against correct answers, calculates raw score and IELTS band score.",
)
async def evaluate_reading_test(payload: ReadingSubmitRequest):
    try:
        result = ReadingScorer.evaluate(payload)
        return result
    except Exception as e:
        logger.error(f"Failed to evaluate reading test: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Evaluation error: {str(e)}",
        )
