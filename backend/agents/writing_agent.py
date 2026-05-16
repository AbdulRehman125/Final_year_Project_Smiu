# agents/writing_agent.py
# LangChain Agent — IELTS Writing Evaluator (Groq)

import json
import re
from loguru import logger

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from core.config import settings
from prompts.writing_prompts import (
    TASK1_ACADEMIC_SYSTEM_PROMPT,
    TASK1_GENERAL_SYSTEM_PROMPT,
    TASK2_SYSTEM_PROMPT,
)
from tools.writing_tools import (
    check_bullet_points,
    check_word_count_sufficient,
    detect_contractions,
    detect_informal_language,
    calculate_final_band,
    calculate_overall_writing_band,
)
from schemas.writing_schema import (
    WritingEvaluationRequest,
    WritingEvaluationResponse,
    TaskScore,
    WritingError,
    TestType,
)


class WritingEvaluationAgent:
    """
    IELTS Writing Evaluation Agent.
    Uses LangChain + Groq (free) to evaluate Task 1 and Task 2.
    """

    def __init__(self):
        self.llm = ChatGroq(
            model=settings.LLM_MODEL,
            groq_api_key=settings.GROQ_API_KEY,
            max_tokens=settings.LLM_MAX_TOKENS,
            temperature=settings.LLM_TEMPERATURE,
        )
        logger.info(f"WritingEvaluationAgent initialized — Model: {settings.LLM_MODEL}")

    async def evaluate(self, request: WritingEvaluationRequest) -> WritingEvaluationResponse:
        logger.info(f"Starting evaluation — Type: {request.test_type}")

        task1_score = await self._evaluate_task1(
            response_text=request.task1_response,
            question=request.task1_question,
            test_type=request.test_type,
        )

        task2_score = await self._evaluate_task2(
            response_text=request.task2_response,
            question=request.task2_question,
        )

        overall_band = calculate_overall_writing_band.invoke({
            "task1_band": task1_score.overall_band,
            "task2_band": task2_score.overall_band,
        })

        summary = self._generate_summary(task1_score, task2_score, overall_band)

        return WritingEvaluationResponse(
            task1_score=task1_score,
            task2_score=task2_score,
            overall_writing_band=overall_band,
            test_type=request.test_type,
            time_taken_seconds=request.time_taken_seconds,
            summary=summary,
            strengths=list(set(task1_score.strengths + task2_score.strengths))[:4],
            improvements=list(set(task1_score.improvements + task2_score.improvements))[:4],
        )

    async def _evaluate_task1(self, response_text, question, test_type):
        logger.info("Evaluating Task 1...")

        wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 150})
        has_bullets = check_bullet_points.invoke({"text": response_text})
        informal_words = detect_informal_language.invoke({"text": response_text})

        system_prompt = TASK1_ACADEMIC_SYSTEM_PROMPT if test_type == TestType.ACADEMIC else TASK1_GENERAL_SYSTEM_PROMPT

        user_message = f"""
CHART/TASK INFORMATION:
Chart Type: {question.chart_type}
Question Prompt: {question.prompt_text}
Chart Description: {question.description}

CANDIDATE'S RESPONSE:
{response_text}

PRE-ANALYSIS:
- Word Count: {wc_check['word_count']} (minimum 150)
- Word Count Sufficient: {wc_check['sufficient']}
- Bullet Points Found: {has_bullets}
- Informal Language: {informal_words}

Return ONLY valid JSON. No extra text.
"""
        llm_response = await self._call_llm(system_prompt, user_message)
        return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

    async def _evaluate_task2(self, response_text, question):
        logger.info("Evaluating Task 2...")

        wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 250})
        has_bullets = check_bullet_points.invoke({"text": response_text})
        contractions = detect_contractions.invoke({"text": response_text})
        informal_words = detect_informal_language.invoke({"text": response_text})

        user_message = f"""
ESSAY QUESTION:
Essay Type: {question.essay_type}
Question: {question.prompt_text}

CANDIDATE'S RESPONSE:
{response_text}

PRE-ANALYSIS:
- Word Count: {wc_check['word_count']} (minimum 250)
- Word Count Sufficient: {wc_check['sufficient']}
- Bullet Points Found: {has_bullets}
- Contractions Found (errors in formal essay): {contractions}
- Informal Language: {informal_words}

Return ONLY valid JSON. No extra text.
"""
        llm_response = await self._call_llm(TASK2_SYSTEM_PROMPT, user_message)
        return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

    async def _call_llm(self, system_prompt: str, user_message: str) -> str:
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_message),
            ]
            response = await self.llm.ainvoke(messages)
            return response.content
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            raise

    def _parse_task_score(self, llm_response: str, word_count: int, word_count_sufficient: bool) -> TaskScore:
        try:
            clean = re.sub(r'```(?:json)?\n?', '', llm_response).strip()
            clean = clean.rstrip('`').strip()
            data = json.loads(clean)

            recalculated_band = calculate_final_band.invoke({
                "task_achievement": data["band_task_achievement"],
                "coherence_cohesion": data["band_coherence_cohesion"],
                "lexical_resource": data["band_lexical_resource"],
                "grammatical_range": data["band_grammatical_range"],
            })

            errors = [
                WritingError(
                    error_type=e.get("error_type", "grammar"),
                    original=e.get("original", ""),
                    correction=e.get("correction", ""),
                    rule=e.get("rule", ""),
                )
                for e in data.get("errors", [])
            ]

            return TaskScore(
                band_task_achievement=data["band_task_achievement"],
                band_coherence_cohesion=data["band_coherence_cohesion"],
                band_lexical_resource=data["band_lexical_resource"],
                band_grammatical_range=data["band_grammatical_range"],
                overall_band=recalculated_band,
                feedback_task_achievement=data["feedback_task_achievement"],
                feedback_coherence_cohesion=data["feedback_coherence_cohesion"],
                feedback_lexical_resource=data["feedback_lexical_resource"],
                feedback_grammatical_range=data["feedback_grammatical_range"],
                errors=errors,
                word_count=word_count,
                word_count_sufficient=word_count_sufficient,
                strengths=data.get("strengths", []),
                improvements=data.get("improvements", []),
            )

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}\nRaw: {llm_response}")
            raise ValueError(f"LLM returned invalid JSON: {e}")
        except KeyError as e:
            logger.error(f"Missing key: {e}")
            raise ValueError(f"LLM response missing field: {e}")

    def _generate_summary(self, task1, task2, overall):
        if overall >= 7.0:
            level, msg = "Good to Very Good", "You demonstrate strong writing skills."
        elif overall >= 6.0:
            level, msg = "Competent", "You have a good command of English with some inaccuracies."
        elif overall >= 5.0:
            level, msg = "Modest", "You have a partial command of English with noticeable limitations."
        else:
            level, msg = "Limited", "There are significant areas that need improvement."

        return (
            f"Overall Band: {overall} ({level}). {msg} "
            f"Task 1: {task1.overall_band} | Task 2: {task2.overall_band}. "
            f"Task 2 carries twice the weight in your final score."
        )