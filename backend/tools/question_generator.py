# # tools/question_generator.py
# # LangChain Tool — IELTS Question Generator
# # LLM khud IELTS rules ke mutabik questions generate karta hai

# import json
# import re
# import random
# from langchain_core.tools import tool
# from loguru import logger


# # ── IELTS Task 2 Essay Types ──────────────────

# TASK2_ESSAY_TYPES = [
#     "opinion",
#     "discussion",
#     "advantage_disadvantage",
#     "problem_solution",
#     "two_part",
# ]

# # ── IELTS Task 2 Topics (real past paper topics) ──

# TASK2_TOPICS = [
#     "technology and social media",
#     "environment and climate change",
#     "education and schools",
#     "health and medicine",
#     "government and society",
#     "work and employment",
#     "crime and punishment",
#     "travel and tourism",
#     "urbanization and cities",
#     "family and relationships",
#     "arts and culture",
#     "science and research",
#     "globalization and trade",
#     "media and advertising",
#     "sport and leisure",
# ]

# # ── Task 1 Chart Types ────────────────────────

# TASK1_CHART_TYPES = [
#     "bar_chart",
#     "line_graph",
#     "pie_chart",
#     "table",
#     "process_diagram",
#     "map",
# ]

# # ── Task 1 Topics for Academic ────────────────

# TASK1_ACADEMIC_TOPICS = [
#     "employment rates by sector",
#     "population growth in cities",
#     "internet usage by age group",
#     "energy consumption by country",
#     "student enrollment in universities",
#     "household income distribution",
#     "transportation usage trends",
#     "water consumption per capita",
#     "carbon emissions by industry",
#     "tourism arrivals by region",
#     "literacy rates by gender",
#     "smartphone ownership statistics",
#     "renewable energy production",
#     "crime rates over decades",
#     "healthcare spending by country",
# ]


# TASK2_GENERATION_PROMPT = """You are an official IELTS question writer with 15+ years experience.
# Generate ONE authentic IELTS Writing Task 2 question.

# RULES:
# - Essay type: {essay_type}
# - Topic area: {topic}
# - Must match real IELTS past paper style exactly
# - Must be clear, unambiguous, and academically appropriate
# - Opinion type: end with "To what extent do you agree or disagree?"
# - Discussion type: end with "Discuss both views and give your own opinion."
# - Advantage/Disadvantage: ask about both advantages AND disadvantages
# - Problem/Solution: ask about causes/problems AND solutions
# - Two-part: ask exactly TWO distinct questions

# Return ONLY this JSON, no extra text:
# {{
#   "essay_type": "{essay_type}",
#   "prompt_text": "<full question text here, 2-4 sentences>"
# }}"""


# TASK1_GENERATION_PROMPT = """You are an official IELTS question writer with 15+ years experience.
# Generate ONE authentic IELTS Writing Task 1 Academic question.

# RULES:
# - Chart type: {chart_type}
# - Topic: {topic}
# - Must match real IELTS past paper style exactly
# - Always end with: "Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
# - The description should be realistic and specific with actual data points

# Return ONLY this JSON, no extra text:
# {{
#   "chart_type": "{chart_type}",
#   "prompt_text": "<full question including chart description and instruction>",
#   "description": "<detailed description of what the chart shows, with specific data points, years, percentages etc. that the student can use to write their report>"
# }}"""











# # tools/question_generator.py
# # LangChain Tool — IELTS Question Generator
# # LLM khud IELTS rules ke mutabik questions generate karta hai

# import json
# import re
# import random
# from langchain_core.tools import tool
# from loguru import logger


# # ── IELTS Task 2 Essay Types ──────────────────

# TASK2_ESSAY_TYPES = [
#     "opinion",
#     "discussion",
#     "advantage_disadvantage",
#     "problem_solution",
#     "two_part",
# ]

# # ── IELTS Task 2 Topics (real past paper topics) ──

# TASK2_TOPICS = [
#     "technology and social media",
#     "environment and climate change",
#     "education and schools",
#     "health and medicine",
#     "government and society",
#     "work and employment",
#     "crime and punishment",
#     "travel and tourism",
#     "urbanization and cities",
#     "family and relationships",
#     "arts and culture",
#     "science and research",
#     "globalization and trade",
#     "media and advertising",
#     "sport and leisure",
# ]

# # ── Task 1 Chart Types ────────────────────────
# # Note: "map" intentionally excluded — LLM-generated maps can't be made
# # geographically reliable, so we only support chart types that render
# # cleanly from structured numeric/text data (native Recharts/table/flow).

# TASK1_CHART_TYPES = [
#     "bar_chart",
#     "line_graph",
#     "pie_chart",
#     "table",
#     "process_diagram",
# ]

# # ── Task 1 Topics for Academic ────────────────

# TASK1_ACADEMIC_TOPICS = [
#     "employment rates by sector",
#     "population growth in cities",
#     "internet usage by age group",
#     "energy consumption by country",
#     "student enrollment in universities",
#     "household income distribution",
#     "transportation usage trends",
#     "water consumption per capita",
#     "carbon emissions by industry",
#     "tourism arrivals by region",
#     "literacy rates by gender",
#     "smartphone ownership statistics",
#     "renewable energy production",
#     "crime rates over decades",
#     "healthcare spending by country",
# ]


# TASK2_GENERATION_PROMPT = """You are an official IELTS question writer with 15+ years experience.
# Generate ONE authentic IELTS Writing Task 2 question.

# RULES:
# - Essay type: {essay_type}
# - Topic area: {topic}
# - Must match real IELTS past paper style exactly
# - Must be clear, unambiguous, and academically appropriate
# - Opinion type: end with "To what extent do you agree or disagree?"
# - Discussion type: end with "Discuss both views and give your own opinion."
# - Advantage/Disadvantage: ask about both advantages AND disadvantages
# - Problem/Solution: ask about causes/problems AND solutions
# - Two-part: ask exactly TWO distinct questions

# Return ONLY this JSON, no extra text:
# {{
#   "essay_type": "{essay_type}",
#   "prompt_text": "<full question text here, 2-4 sentences>"
# }}"""


# # ─────────────────────────────────────────────
# # STRUCTURED CHART DATA GENERATION
# # Each chart type needs a different JSON "shape" so the frontend can
# # render it natively (Recharts / table / step-flow) instead of an image.
# # ─────────────────────────────────────────────

# _CHART_DATA_SHAPE_INSTRUCTIONS = {
#     "bar_chart": """
# DATA SHAPE — populate "categories" and "series", leave "columns"/"rows"/"steps" as []:
# - "categories": list of 4-8 x-axis group labels (e.g. years, countries, age groups)
# - "series": list of 1-3 objects {{"name": "<series label>", "data": [<one number per category, same order>]}}
#   Example: series names like "Owned", "Rented" for a comparison bar chart.
# - Numbers must be realistic and internally consistent with the trend described in prompt_text.""",

#     "line_graph": """
# DATA SHAPE — populate "categories" and "series", leave "columns"/"rows"/"steps" as []:
# - "categories": list of 5-10 x-axis points, typically years in chronological order (e.g. "1990", "1995", ...)
# - "series": list of 1-4 objects {{"name": "<line label>", "data": [<one number per category, same order>]}}
# - Values should form a plausible, smooth trend (rising/falling/fluctuating) consistent with prompt_text — avoid random noise.""",

#     "pie_chart": """
# DATA SHAPE — populate "categories" and "series" with EXACTLY ONE series, leave "columns"/"rows"/"steps" as []:
# - "categories": list of 4-7 slice labels
# - "series": a list containing exactly ONE object {{"name": "<chart subject>", "data": [<one number per category>]}}
# - If unit is "%", the numbers in "data" MUST sum to exactly 100.""",

#     "table": """
# DATA SHAPE — populate "columns" and "rows", leave "categories"/"series"/"steps" as []:
# - "columns": list of 3-6 column header strings (first column is usually a row label, e.g. "Country" or "Year")
# - "rows": list of 4-8 rows, each row is a list of strings with the SAME length as "columns"
#   (numeric values as strings, e.g. "42.5" — the label column can be text like a country/year name).""",

#     "process_diagram": """
# DATA SHAPE — populate "steps", leave "categories"/"series"/"columns"/"rows" as []:
# - "steps": ordered list of 4-8 short strings, each describing ONE stage of the process in sequence
#   (e.g. "Raw water enters the treatment plant", "Chemicals are added to remove impurities", ...).
#   This should describe an actual real-world process (manufacturing, natural cycle, recycling, etc.)
#   relevant to the given topic.""",
# }


# def build_task1_generation_prompt(chart_type: str, topic: str) -> str:
#     """
#     Build the Task 1 Academic generation prompt for a specific chart_type,
#     including the structured-data shape instructions the LLM must follow
#     so the frontend can render a native chart (not an image).
#     """
#     shape_instructions = _CHART_DATA_SHAPE_INSTRUCTIONS.get(
#         chart_type, _CHART_DATA_SHAPE_INSTRUCTIONS["bar_chart"]
#     )

#     return f"""You are an official IELTS question writer with 15+ years experience.
# Generate ONE authentic IELTS Writing Task 1 Academic question with REALISTIC,
# INTERNALLY CONSISTENT chart data — a student will see this rendered as a real chart.

# RULES:
# - Chart type: {chart_type}
# - Topic: {topic}
# - Must match real IELTS past paper style exactly
# - prompt_text must end with: "Summarise the information by selecting and reporting the
#   main features, and make comparisons where relevant."
# - All numbers must be plausible and internally consistent with a sensible real-world trend
#   for the topic — this is the actual data the student will analyse, so it must make sense.
# {shape_instructions}

# Return ONLY this JSON, no markdown, no extra text:
# {{
#   "chart_type": "{chart_type}",
#   "prompt_text": "<full question: 1-2 sentences introducing the chart + the standard closing instruction>",
#   "title": "<short factual chart title, e.g. 'Percentage of households in owned vs rented accommodation (1918-2011)'>",
#   "unit": "<unit of measurement shown on the chart, e.g. '%', 'million tonnes', or empty string>",
#   "categories": [],
#   "series": [],
#   "columns": [],
#   "rows": [],
#   "steps": []
# }}"""





















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
# Only genuinely visual chart types are generated — "table" and
# "process_diagram" render as text/lists, not charts, and users
# consistently want an actual chart every time. "map" stays excluded
# for the same reason as before (can't be made geographically reliable).

TASK1_CHART_TYPES = [
    "bar_chart",
    "line_graph",
    "pie_chart",
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


# ─────────────────────────────────────────────
# STRUCTURED CHART DATA GENERATION
# Each chart type needs a different JSON "shape" so the frontend can
# render it natively (Recharts / table / step-flow) instead of an image.
# ─────────────────────────────────────────────

_CHART_DATA_SHAPE_INSTRUCTIONS = {
    "bar_chart": """
DATA SHAPE — populate "categories" and "series", leave "columns"/"rows"/"steps" as []:
- "categories": list of 4-8 x-axis group labels (e.g. years, countries, age groups)
- "series": list of 1-3 objects {{"name": "<series label>", "data": [<one number per category, same order>]}}
  Example: series names like "Owned", "Rented" for a comparison bar chart.
- Numbers must be realistic and internally consistent with the trend described in prompt_text.""",

    "line_graph": """
DATA SHAPE — populate "categories" and "series", leave "columns"/"rows"/"steps" as []:
- "categories": list of 5-10 x-axis points, typically years in chronological order (e.g. "1990", "1995", ...)
- "series": list of 1-4 objects {{"name": "<line label>", "data": [<one number per category, same order>]}}
- Values should form a plausible, smooth trend (rising/falling/fluctuating) consistent with prompt_text — avoid random noise.""",

    "pie_chart": """
DATA SHAPE — populate "categories" and "series" with EXACTLY ONE series, leave "columns"/"rows"/"steps" as []:
- "categories": list of 4-7 slice labels
- "series": a list containing exactly ONE object {{"name": "<chart subject>", "data": [<one number per category>]}}
- If unit is "%", the numbers in "data" MUST sum to exactly 100.""",

    "table": """
DATA SHAPE — populate "columns" and "rows", leave "categories"/"series"/"steps" as []:
- "columns": list of 3-6 column header strings (first column is usually a row label, e.g. "Country" or "Year")
- "rows": list of 4-8 rows, each row is a list of strings with the SAME length as "columns"
  (numeric values as strings, e.g. "42.5" — the label column can be text like a country/year name).""",

    "process_diagram": """
DATA SHAPE — populate "steps", leave "categories"/"series"/"columns"/"rows" as []:
- "steps": ordered list of 4-8 short strings, each describing ONE stage of the process in sequence
  (e.g. "Raw water enters the treatment plant", "Chemicals are added to remove impurities", ...).
  This should describe an actual real-world process (manufacturing, natural cycle, recycling, etc.)
  relevant to the given topic.""",
}


def build_task1_generation_prompt(chart_type: str, topic: str) -> str:
    """
    Build the Task 1 Academic generation prompt for a specific chart_type,
    including the structured-data shape instructions the LLM must follow
    so the frontend can render a native chart (not an image).
    """
    shape_instructions = _CHART_DATA_SHAPE_INSTRUCTIONS.get(
        chart_type, _CHART_DATA_SHAPE_INSTRUCTIONS["bar_chart"]
    )

    return f"""You are an official IELTS question writer with 15+ years experience.
Generate ONE authentic IELTS Writing Task 1 Academic question with REALISTIC,
INTERNALLY CONSISTENT chart data — a student will see this rendered as a real chart.

RULES:
- Chart type: {chart_type}
- Topic: {topic}
- Must match real IELTS past paper style exactly
- prompt_text must end with: "Summarise the information by selecting and reporting the
  main features, and make comparisons where relevant."
- All numbers must be plausible and internally consistent with a sensible real-world trend
  for the topic — this is the actual data the student will analyse, so it must make sense.
{shape_instructions}

Return ONLY this JSON, no markdown, no extra text:
{{
  "chart_type": "{chart_type}",
  "prompt_text": "<full question: 1-2 sentences introducing the chart + the standard closing instruction>",
  "title": "<short factual chart title, e.g. 'Percentage of households in owned vs rented accommodation (1918-2011)'>",
  "unit": "<unit of measurement shown on the chart, e.g. '%', 'million tonnes', or empty string>",
  "categories": [],
  "series": [],
  "columns": [],
  "rows": [],
  "steps": []
}}"""