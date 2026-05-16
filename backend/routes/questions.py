# routes/questions.py
# FastAPI Route — Question Generator

from fastapi import APIRouter, HTTPException, Query
from loguru import logger

from agents.question_agent import QuestionGeneratorAgent
from schemas.question_schema import GeneratedWritingQuestions, TestType

router = APIRouter()
agent = QuestionGeneratorAgent()


@router.get("/generate", response_model=GeneratedWritingQuestions)
async def generate_questions(
    test_type: TestType = Query(default=TestType.ACADEMIC, description="academic or general")
):
    """
    Generate a fresh set of IELTS Writing questions (Task 1 + Task 2).
    LLM generates random authentic questions on every call.
    """
    logger.info(f"Question generation request — Type: {test_type}")
    try:
        questions = await agent.generate_questions(test_type)
        logger.success(f"Questions generated — T2 type: {questions.task2.essay_type}")
        return questions
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate questions.")
