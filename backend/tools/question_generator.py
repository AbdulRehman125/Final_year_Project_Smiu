# tools/question_generator.py
# LangChain Tool — IELTS Question Generator
# LLM khud IELTS rules ke mutabik questions generate karta hai

import json
import re
import random
from langchain_core.tools import tool
from loguru import logger


# ── IELTS Task 2 Essay Types ──────────────────

TASK2_ESSAY_TYPES = [
    "opinion",
    "discussion",
    "advantage_disadvantage",
    "problem_solution",
    "two_part",
]

# ── IELTS Task 2 Topics (real past paper topics) ──

TASK2_TOPICS = [
    "technology and social media",
    "environment and climate change",
    "education and schools",
    "health and medicine",
    "government and society",
    "work and employment",
    "crime and punishment",
    "travel and tourism",
    "urbanization and cities",
    "family and relationships",
    "arts and culture",
    "science and research",
    "globalization and trade",
    "media and advertising",
    "sport and leisure",
]

# ── Task 1 Chart Types ────────────────────────

TASK1_CHART_TYPES = [
    "bar_chart",
    "line_graph",
    "pie_chart",
    "table",
    "process_diagram",
    "map",
]

# ── Task 1 Topics for Academic ────────────────

TASK1_ACADEMIC_TOPICS = [
    "employment rates by sector",
    "population growth in cities",
    "internet usage by age group",
    "energy consumption by country",
    "student enrollment in universities",
    "household income distribution",
    "transportation usage trends",
    "water consumption per capita",
    "carbon emissions by industry",
    "tourism arrivals by region",
    "literacy rates by gender",
    "smartphone ownership statistics",
    "renewable energy production",
    "crime rates over decades",
    "healthcare spending by country",
]


TASK2_GENERATION_PROMPT = """You are an official IELTS question writer with 15+ years experience.
Generate ONE authentic IELTS Writing Task 2 question.

RULES:
- Essay type: {essay_type}
- Topic area: {topic}
- Must match real IELTS past paper style exactly
- Must be clear, unambiguous, and academically appropriate
- Opinion type: end with "To what extent do you agree or disagree?"
- Discussion type: end with "Discuss both views and give your own opinion."
- Advantage/Disadvantage: ask about both advantages AND disadvantages
- Problem/Solution: ask about causes/problems AND solutions
- Two-part: ask exactly TWO distinct questions

Return ONLY this JSON, no extra text:
{{
  "essay_type": "{essay_type}",
  "prompt_text": "<full question text here, 2-4 sentences>"
}}"""


TASK1_GENERATION_PROMPT = """You are an official IELTS question writer with 15+ years experience.
Generate ONE authentic IELTS Writing Task 1 Academic question.

RULES:
- Chart type: {chart_type}
- Topic: {topic}
- Must match real IELTS past paper style exactly
- Always end with: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
- The description should be realistic and specific with actual data points

Return ONLY this JSON, no extra text:
{{
  "chart_type": "{chart_type}",
  "prompt_text": "<full question including chart description and instruction>",
  "description": "<detailed description of what the chart shows, with specific data points, years, percentages etc. that the student can use to write their report>"
}}"""
