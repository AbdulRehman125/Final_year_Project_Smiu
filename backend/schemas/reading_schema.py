# backend/schemas/reading_schema.py — Pydantic schemas for Reading module

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ParagraphSchema(BaseModel):
    label: Optional[str] = ""
    text: Optional[str] = ""

class ReadingPassageSchema(BaseModel):
    index: int = 0
    title: Optional[str] = "Reading Passage"
    difficulty: Optional[str] = "moderate"
    topic: Optional[str] = ""
    paragraphs: Optional[List[ParagraphSchema]] = []
    questionRange: Optional[List[int]] = [1, 13]

class ReadingQuestionSchema(BaseModel):
    index: int
    passageIndex: Optional[int] = 0
    type: Optional[str] = "mcq"
    text: Optional[str] = ""
    options: Optional[List[Any]] = None
    correctAnswer: Optional[Any] = ""
    explanation: Optional[str] = None
    paragraphRef: Optional[str] = None

class ReadingTestGenerateResponse(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = "IELTS Academic Reading Test"
    difficulty: Optional[str] = "mixed"
    passages: List[ReadingPassageSchema] = []
    questions: List[ReadingQuestionSchema] = []
    topics: Optional[List[str]] = []
    totalQuestions: Optional[int] = 40

class ReadingSubmitRequest(BaseModel):
    answers: Optional[Dict[str, str]] = None
    userAnswers: Optional[Dict[str, str]] = None
    timeTakenSeconds: Optional[int] = 0
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
    passageIndex: int = 0
    type: str = "mcq"
    text: str = ""
    userAnswer: str = ""
    correctAnswer: str = ""
    isCorrect: bool = False
    explanation: Optional[str] = None
    paragraphRef: Optional[str] = None

class ReadingSubmitResponse(BaseModel):
    score: int
    bandScore: float
    accuracy: float
    timeTakenSeconds: int
    passageScores: List[PassageScoreSchema]
    questionTypeScores: List[QuestionTypeScoreSchema]
    questionResults: List[QuestionResultSchema]
    recommendations: List[str]
