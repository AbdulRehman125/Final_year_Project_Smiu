

























# # agents/question_agent.py
# # IELTS Question Generator Agent
# # LLM generates fresh, authentic IELTS Writing questions on every call,
# # including structured Task 1 Academic chart data (rendered natively on
# # the frontend — no image files, no DB dependency).

# import json
# import re
# import random
# from loguru import logger

# from langchain_groq import ChatGroq
# from langchain_core.messages import HumanMessage, SystemMessage

# from core.config import settings
# from tools.question_generator import (
#     TASK2_ESSAY_TYPES,
#     TASK2_TOPICS,
#     TASK1_CHART_TYPES,
#     TASK1_ACADEMIC_TOPICS,
#     TASK2_GENERATION_PROMPT,
#     build_task1_generation_prompt,
# )
# from schemas.question_schema import (
#     GeneratedTask1Question,
#     GeneratedTask2Question,
#     GeneratedWritingQuestions,
#     TestType,
# )
# from schemas.writing_schema import Task1ChartData, ChartSeriesData

# QUESTION_SYSTEM_PROMPT = """You are an official IELTS question writer trained by the British Council.
# You generate authentic, exam-ready IELTS Writing questions.
# You ALWAYS return valid JSON only. No preamble, no explanation, no markdown."""


# class QuestionGeneratorAgent:
#     """
#     Generates random IELTS Writing questions using LLM.
#     Each call produces a unique, authentic question set — including
#     structured Task 1 Academic chart data for native frontend rendering.
#     """

#     def __init__(self):
#         self.llm = ChatGroq(
#             model=settings.LLM_MODEL,
#             groq_api_key=settings.GROQ_API_KEY,
#             max_tokens=1536,
#             temperature=0.9,  # High temp = more variety across generations
#         )
#         logger.info("QuestionGeneratorAgent initialized")

#     async def generate_questions(self, test_type: TestType) -> GeneratedWritingQuestions:
#         logger.info(f"Generating questions — Type: {test_type}")

#         task2 = await self._generate_task2()

#         if test_type == TestType.ACADEMIC:
#             task1 = await self._generate_task1_academic()
#         else:
#             task1 = await self._generate_task1_general()

#         return GeneratedWritingQuestions(
#             test_type=test_type,
#             task1=task1,
#             task2=task2,
#         )

#     # ─────────────────────────────────────────
#     # TASK 2 — Essay Question Generator
#     # ─────────────────────────────────────────

#     async def _generate_task2(self) -> GeneratedTask2Question:
#         essay_type = random.choice(TASK2_ESSAY_TYPES)
#         topic = random.choice(TASK2_TOPICS)
#         logger.info(f"Generating Task 2 — {essay_type} | {topic}")

#         prompt = TASK2_GENERATION_PROMPT.format(essay_type=essay_type, topic=topic)
#         response = await self._call_llm(prompt)
#         data = self._parse_json(response)

#         return GeneratedTask2Question(
#             id=f"t2_{essay_type}_{random.randint(1000, 9999)}",
#             essay_type=data.get("essay_type", essay_type),
#             prompt_text=data["prompt_text"],
#         )

#     # ─────────────────────────────────────────
#     # TASK 1 ACADEMIC — Native Chart Generator
#     # ─────────────────────────────────────────

#     async def _generate_task1_academic(self) -> GeneratedTask1Question:
#         chart_type = random.choice(TASK1_CHART_TYPES)
#         topic = random.choice(TASK1_ACADEMIC_TOPICS)
#         logger.info(f"Generating Task 1 Academic — {chart_type} | {topic}")

#         prompt = build_task1_generation_prompt(chart_type, topic)
#         response = await self._call_llm(prompt)
#         data = self._parse_json(response)

#         chart_data = self._build_chart_data(chart_type, data)

#         return GeneratedTask1Question(
#             id=f"t1_{chart_type}_{random.randint(1000, 9999)}",
#             chart_type=data.get("chart_type", chart_type),
#             prompt_text=data["prompt_text"],
#             description=self._chart_data_to_description(chart_data),
#             chart_data=chart_data,
#             test_type="academic",
#         )

#     def _build_chart_data(self, chart_type: str, data: dict) -> Task1ChartData:
#         """Convert the LLM's raw JSON into a validated Task1ChartData model."""
#         series = [
#             ChartSeriesData(name=s.get("name", ""), data=[float(v) for v in s.get("data", [])])
#             for s in data.get("series", [])
#         ]
#         return Task1ChartData(
#             chart_type=data.get("chart_type", chart_type),
#             title=data.get("title", ""),
#             unit=data.get("unit", ""),
#             categories=data.get("categories", []),
#             series=series,
#             columns=data.get("columns", []),
#             rows=data.get("rows", []),
#             steps=data.get("steps", []),
#         )

#     def _chart_data_to_description(self, chart_data: Task1ChartData) -> str:
#         """
#         Build a plain-text description of the chart for the WRITING
#         evaluator agent's pre-analysis context (it doesn't see the
#         rendered chart — only this text plus the candidate's response).
#         """
#         unit_suffix = f" ({chart_data.unit})" if chart_data.unit else ""

#         if chart_data.series and chart_data.categories:
#             series_lines = [
#                 f"{s.name}: " + ", ".join(f"{c}={v}" for c, v in zip(chart_data.categories, s.data))
#                 for s in chart_data.series
#             ]
#             return f"{chart_data.title}{unit_suffix}. " + " | ".join(series_lines)

#         if chart_data.columns and chart_data.rows:
#             header = " / ".join(chart_data.columns)
#             rows = "; ".join(" / ".join(row) for row in chart_data.rows)
#             return f"{chart_data.title}. Columns: {header}. Rows: {rows}"

#         if chart_data.steps:
#             return f"{chart_data.title}. Steps: " + " → ".join(chart_data.steps)

#         return chart_data.title or "Chart data unavailable."

#     # ─────────────────────────────────────────
#     # TASK 1 GENERAL — Letter Generator
#     # ─────────────────────────────────────────

#     async def _generate_task1_general(self) -> GeneratedTask1Question:
#         logger.info("Generating Task 1 General — Letter")

#         prompt = """You are an official IELTS question writer.
# Generate ONE authentic IELTS General Training Writing Task 1 letter question.

# RULES:
# - Must be a realistic situation requiring a letter
# - Must include exactly 3 bullet points the student must cover
# - Letter type: formal, semi-formal, or informal
# - Match real IELTS past paper style exactly

# Return ONLY this JSON:
# {
#   "letter_type": "formal|semi-formal|informal",
#   "prompt_text": "<full situation + 3 bullet points>",
#   "description": "<brief summary>"
# }"""

#         response = await self._call_llm(prompt)
#         data = self._parse_json(response)

#         return GeneratedTask1Question(
#             id=f"t1_letter_{random.randint(1000, 9999)}",
#             chart_type="letter",
#             prompt_text=data["prompt_text"],
#             description=data.get("description", ""),
#             chart_data=None,
#             test_type="general",
#         )

#     # ─────────────────────────────────────────
#     # LLM CALL
#     # ─────────────────────────────────────────

#     async def _call_llm(self, user_prompt: str) -> str:
#         messages = [
#             SystemMessage(content=QUESTION_SYSTEM_PROMPT),
#             HumanMessage(content=user_prompt),
#         ]
#         response = await self.llm.ainvoke(messages)
#         return response.content

#     def _parse_json(self, response: str) -> dict:
#         clean = re.sub(r'```(?:json)?\n?', '', response).strip().rstrip('`')
#         # strict=False: LLM output sometimes contains raw newlines/control
#         # characters inside string values (e.g. multi-line letter bullet
#         # points) which are technically invalid per strict JSON but are
#         # harmless and expected here — allow them instead of erroring out.
#         return json.loads(clean, strict=False)































# agents/question_agent.py
# IELTS Question Generator Agent
# LLM generates fresh, authentic IELTS Writing questions on every call,
# including structured Task 1 Academic chart data (rendered natively on
# the frontend — no image files, no DB dependency).

import json
import re
import random
from loguru import logger

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from core.config import settings
from tools.question_generator import (
    TASK2_ESSAY_TYPES,
    TASK2_TOPICS,
    TASK1_CHART_TYPES,
    TASK1_ACADEMIC_TOPICS,
    TASK2_GENERATION_PROMPT,
    build_task1_generation_prompt,
)
from schemas.question_schema import (
    GeneratedTask1Question,
    GeneratedTask2Question,
    GeneratedWritingQuestions,
    TestType,
)
from schemas.writing_schema import Task1ChartData, ChartSeriesData

QUESTION_SYSTEM_PROMPT = """You are an official IELTS question writer trained by the British Council.
You generate authentic, exam-ready IELTS Writing questions.
You ALWAYS return valid JSON only. No preamble, no explanation, no markdown."""


class QuestionGeneratorAgent:
    """
    Generates random IELTS Writing questions using LLM.
    Each call produces a unique, authentic question set — including
    structured Task 1 Academic chart data for native frontend rendering.
    """

    def __init__(self):
        self.llm = ChatGroq(
            model=settings.LLM_MODEL,
            groq_api_key=settings.GROQ_API_KEY,
            max_tokens=1000,  # trimmed from 1536 — question JSON responses fit comfortably
            temperature=0.9,  # High temp = more variety across generations
        )
        logger.info("QuestionGeneratorAgent initialized")

    async def generate_questions(self, test_type: TestType) -> GeneratedWritingQuestions:
        logger.info(f"Generating questions — Type: {test_type}")

        task2 = await self._generate_task2()

        if test_type == TestType.ACADEMIC:
            task1 = await self._generate_task1_academic()
        else:
            task1 = await self._generate_task1_general()

        return GeneratedWritingQuestions(
            test_type=test_type,
            task1=task1,
            task2=task2,
        )

    # ─────────────────────────────────────────
    # TASK 2 — Essay Question Generator
    # ─────────────────────────────────────────

    async def _generate_task2(self) -> GeneratedTask2Question:
        essay_type = random.choice(TASK2_ESSAY_TYPES)
        topic = random.choice(TASK2_TOPICS)
        logger.info(f"Generating Task 2 — {essay_type} | {topic}")

        prompt = TASK2_GENERATION_PROMPT.format(essay_type=essay_type, topic=topic)
        response = await self._call_llm(prompt)
        data = self._parse_json(response)

        return GeneratedTask2Question(
            id=f"t2_{essay_type}_{random.randint(1000, 9999)}",
            essay_type=data.get("essay_type", essay_type),
            prompt_text=data["prompt_text"],
        )

    # ─────────────────────────────────────────
    # TASK 1 ACADEMIC — Native Chart Generator
    # ─────────────────────────────────────────

    async def _generate_task1_academic(self) -> GeneratedTask1Question:
        chart_type = random.choice(TASK1_CHART_TYPES)
        topic = random.choice(TASK1_ACADEMIC_TOPICS)
        logger.info(f"Generating Task 1 Academic — {chart_type} | {topic}")

        prompt = build_task1_generation_prompt(chart_type, topic)
        response = await self._call_llm(prompt)
        data = self._parse_json(response)

        chart_data = self._build_chart_data(chart_type, data)

        return GeneratedTask1Question(
            id=f"t1_{chart_type}_{random.randint(1000, 9999)}",
            chart_type=data.get("chart_type", chart_type),
            prompt_text=data["prompt_text"],
            description=self._chart_data_to_description(chart_data),
            chart_data=chart_data,
            test_type="academic",
        )

    def _build_chart_data(self, chart_type: str, data: dict) -> Task1ChartData:
        """Convert the LLM's raw JSON into a validated Task1ChartData model."""
        series = [
            ChartSeriesData(name=s.get("name", ""), data=[float(v) for v in s.get("data", [])])
            for s in data.get("series", [])
        ]
        return Task1ChartData(
            chart_type=data.get("chart_type", chart_type),
            title=data.get("title", ""),
            unit=data.get("unit", ""),
            categories=data.get("categories", []),
            series=series,
            columns=data.get("columns", []),
            rows=data.get("rows", []),
            steps=data.get("steps", []),
        )

    def _chart_data_to_description(self, chart_data: Task1ChartData) -> str:
        """
        Build a plain-text description of the chart for the WRITING
        evaluator agent's pre-analysis context (it doesn't see the
        rendered chart — only this text plus the candidate's response).
        """
        unit_suffix = f" ({chart_data.unit})" if chart_data.unit else ""

        if chart_data.series and chart_data.categories:
            series_lines = [
                f"{s.name}: " + ", ".join(f"{c}={v}" for c, v in zip(chart_data.categories, s.data))
                for s in chart_data.series
            ]
            return f"{chart_data.title}{unit_suffix}. " + " | ".join(series_lines)

        if chart_data.columns and chart_data.rows:
            header = " / ".join(chart_data.columns)
            rows = "; ".join(" / ".join(row) for row in chart_data.rows)
            return f"{chart_data.title}. Columns: {header}. Rows: {rows}"

        if chart_data.steps:
            return f"{chart_data.title}. Steps: " + " → ".join(chart_data.steps)

        return chart_data.title or "Chart data unavailable."

    # ─────────────────────────────────────────
    # TASK 1 GENERAL — Letter Generator
    # ─────────────────────────────────────────

    async def _generate_task1_general(self) -> GeneratedTask1Question:
        logger.info("Generating Task 1 General — Letter")

        prompt = """You are an official IELTS question writer.
Generate ONE authentic IELTS General Training Writing Task 1 letter question.

RULES:
- Must be a realistic situation requiring a letter
- Must include exactly 3 bullet points the student must cover
- Letter type: formal, semi-formal, or informal
- Match real IELTS past paper style exactly

Return ONLY this JSON:
{
  "letter_type": "formal|semi-formal|informal",
  "prompt_text": "<full situation + 3 bullet points>",
  "description": "<brief summary>"
}"""

        response = await self._call_llm(prompt)
        data = self._parse_json(response)

        return GeneratedTask1Question(
            id=f"t1_letter_{random.randint(1000, 9999)}",
            chart_type="letter",
            prompt_text=data["prompt_text"],
            description=data.get("description", ""),
            chart_data=None,
            test_type="general",
        )

    # ─────────────────────────────────────────
    # LLM CALL
    # ─────────────────────────────────────────

    async def _call_llm(self, user_prompt: str) -> str:
        messages = [
            SystemMessage(content=QUESTION_SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]
        response = await self.llm.ainvoke(messages)
        return response.content

    def _parse_json(self, response: str) -> dict:
        clean = re.sub(r'```(?:json)?\n?', '', response).strip().rstrip('`')
        # strict=False: LLM output sometimes contains raw newlines/control
        # characters inside string values (e.g. multi-line letter bullet
        # points) which are technically invalid per strict JSON but are
        # harmless and expected here — allow them instead of erroring out.
        return json.loads(clean, strict=False)