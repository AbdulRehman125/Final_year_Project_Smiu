from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class SpeakingPart(str, Enum):
    PART1 = "part1"
    PART2 = "part2"
    PART3 = "part3"
    COMPLETED = "completed"


class Message(BaseModel):
    role: str  # "examiner" | "candidate"
    content: str
    part: SpeakingPart


class Part2Topic(BaseModel):
    title: str
    bullet_points: List[str]


class AgentResponse(BaseModel):
    examiner_text: str
    current_part: SpeakingPart
    test_complete: bool = False
    part2_topic: Optional[Part2Topic] = None
    question_number: int = 0


class CriterionScore(BaseModel):
    band: float
    feedback: str
    examples: List[str]          # Actual quotes from transcript
    improvements: List[str]


class SpeakingResult(BaseModel):
    fluency_coherence: CriterionScore
    lexical_resource: CriterionScore
    grammatical_range: CriterionScore
    pronunciation: CriterionScore
    overall_band: float
    general_feedback: str
