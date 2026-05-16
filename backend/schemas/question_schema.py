# schemas/question_schema.py
# Pydantic models for Question Generator

from pydantic import BaseModel
from typing import Optional
from enum import Enum


class TestType(str, Enum):
    ACADEMIC = "academic"
    GENERAL  = "general"


class GeneratedTask1Question(BaseModel):
    id: str
    chart_type: str           # bar_chart | line_graph | pie_chart | table | process_diagram | map | letter
    prompt_text: str          # Full question text shown to user
    description: str          # What chart shows (used by evaluator agent)
    image_url: str            # Chart image URL (from DB for academic)
    test_type: str            # academic | general


class GeneratedTask2Question(BaseModel):
    id: str
    essay_type: str           # opinion | discussion | advantage_disadvantage | problem_solution | two_part
    prompt_text: str          # Full essay question shown to user


class GeneratedWritingQuestions(BaseModel):
    test_type: TestType
    task1: GeneratedTask1Question
    task2: GeneratedTask2Question
