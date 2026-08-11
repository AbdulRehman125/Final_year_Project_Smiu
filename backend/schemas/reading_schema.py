# backend/schemas/reading_schema.py — Pydantic schemas for Reading module

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class QuestionType(str, Enum):
    MCQ = "mcq"
    TRUE_FALSE_NOT_GIVEN = "true_false_not_given"
    SENTENCE_COMPLETION = "sentence_completion"
    SHORT_ANSWER = "short_answer"
    MATCHING_HEADINGS = "matching_headings"


class PassageDifficulty(str, Enum):
    EASY = "easy"
    MODERATE = "moderate"
    HARD = "hard"


class ParagraphSchema(BaseModel):
    label: str = Field(..., description="Paragraph label like 'A', 'B', 'C'")
    text: str = Field(..., description="Paragraph body text")


class ReadingPassageSchema(BaseModel):
    index: int = Field(..., description="Passage index (0, 1, 2)")
    title: str = Field(..., description="Passage title")
    difficulty: PassageDifficulty
    topic: str
    paragraphs: List[ParagraphSchema]
    questionRange: List[int] = Field(..., description="[startQ, endQ] e.g. [1, 13]")


class ReadingQuestionSchema(BaseModel):
    index: int = Field(..., description="Question index 1-40")
    passageIndex: int = Field(..., description="Passage index (0, 1, 2)")
    type: QuestionType
    text: str = Field(..., description="Question prompt stem")
    options: Optional[List[str]] = Field(None, description="Options for MCQ e.g. ['A. ...', 'B. ...']")
    correctAnswer: str = Field(..., description="Definitive correct answer")
    explanation: Optional[str] = Field(None, description="Explanation for answer review")
    paragraphRef: Optional[str] = Field(None, description="Paragraph label e.g. 'B'")


class ReadingTestGenerateResponse(BaseModel):
    id: Optional[str] = None
    title: str = Field("IELTS Academic Reading Test", description="Test title")
    difficulty: str = "mixed"
    passages: List[ReadingPassageSchema]
    questions: List[ReadingQuestionSchema]
    topics: List[str]
    totalQuestions: int = 40


class ReadingSubmitRequest(BaseModel):
    answers: Dict[str, str] = Field(..., description="Map of question index (as string e.g. '1') to user answer")
    timeTakenSeconds: int = Field(..., ge=0)
    test: ReadingTestGenerateResponse


class PassageScoreSchema(BaseModel):
    passageIndex: int
    difficulty: str
    correct: int
    total: int
    percentage: float


class QuestionTypeScoreSchema(BaseModel):
    type: str
    label: str
    correct: int
    total: int
    percentage: float


class QuestionResultSchema(BaseModel):
    index: int
    passageIndex: int
    type: str
    text: str
    userAnswer: str
    correctAnswer: str
    isCorrect: bool
    explanation: Optional[str] = None
    paragraphRef: Optional[str] = None


class ReadingSubmitResponse(BaseModel):
    score: int = Field(..., description="Raw score out of 40")
    bandScore: float = Field(..., description="IELTS Band score 1.0-9.0")
    accuracy: float = Field(..., description="Percentage 0-100")
    timeTakenSeconds: int
    passageScores: List[PassageScoreSchema]
    questionTypeScores: List[QuestionTypeScoreSchema]
    questionResults: List[QuestionResultSchema]
    recommendations: List[str]
