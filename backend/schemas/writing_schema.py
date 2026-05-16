# schemas/writing_schema.py

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class TestType(str, Enum):
    ACADEMIC = "academic"
    GENERAL = "general"


class Task1ChartType(str, Enum):
    LINE_GRAPH      = "line_graph"
    BAR_CHART       = "bar_chart"
    PIE_CHART       = "pie_chart"
    TABLE           = "table"
    PROCESS_DIAGRAM = "process_diagram"
    MAP             = "map"
    MIXED           = "mixed"


class Task2EssayType(str, Enum):
    OPINION                = "opinion"
    DISCUSSION             = "discussion"
    ADVANTAGE_DISADVANTAGE = "advantage_disadvantage"
    PROBLEM_SOLUTION       = "problem_solution"
    TWO_PART               = "two_part"


class Task1Question(BaseModel):
    id: str
    chart_type: Task1ChartType
    image_url: str
    prompt_text: str
    description: str


class Task2Question(BaseModel):
    id: str
    essay_type: Task2EssayType
    prompt_text: str


class WritingEvaluationRequest(BaseModel):
    test_type: TestType
    task1_question: Task1Question
    task2_question: Task2Question
    task1_response: str = Field(..., min_length=1)
    task2_response: str = Field(..., min_length=1)
    time_taken_seconds: int


class WritingError(BaseModel):
    error_type: str
    original: str
    correction: str
    rule: str
    position: Optional[str] = None


class TaskScore(BaseModel):
    band_task_achievement: float
    band_coherence_cohesion: float
    band_lexical_resource: float
    band_grammatical_range: float
    overall_band: float

    feedback_task_achievement: str
    feedback_coherence_cohesion: str
    feedback_lexical_resource: str
    feedback_grammatical_range: str

    errors: List[WritingError] = []
    word_count: int
    word_count_sufficient: bool

    # ← Yeh 2 fields missing theen — fix
    strengths: List[str] = []
    improvements: List[str] = []


class WritingEvaluationResponse(BaseModel):
    task1_score: TaskScore
    task2_score: TaskScore
    overall_writing_band: float
    test_type: TestType
    time_taken_seconds: int
    summary: str
    strengths: List[str] = []
    improvements: List[str] = []