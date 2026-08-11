from fastapi import APIRouter, HTTPException
from agents.listening_agent import ListeningTestGeneratorAgent, ListeningScorer
from schemas.listening_schema import ListeningSubmitRequest
from loguru import logger

router = APIRouter()

@router.get("/generate")
async def generate_listening_test():
    try:
        agent = ListeningTestGeneratorAgent()
        result = await agent.generate_test()
        return result
    except Exception as e:
        logger.error(f"Failed to generate listening test: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
async def evaluate_listening_test(payload: ListeningSubmitRequest):
    try:
        result = ListeningScorer.evaluate(payload)
        return result
    except Exception as e:
        logger.error(f"Failed to evaluate listening test: {e}")
        raise HTTPException(status_code=500, detail=str(e))
