from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ListeningSectionSchema(BaseModel):
    index: int = 0                               # 0-3
    title: Optional[str] = "Section"            # "Section 1: Booking Accommodation"
    description: Optional[str] = ""             # Context description
    difficulty: Optional[str] = "easy"          # "easy" | "moderate" | "hard"
    speakers: Optional[Any] = 2                 # 1 or 2-3 or "Two speakers"
    speakerNames: Optional[List[str]] = []      # ["Sarah", "Receptionist"]
    durationMinutes: Optional[float] = 7.0      # ~7.0
    questionRange: Optional[List[int]] = [1, 10]# [1, 10]
    transcript: Optional[str] = ""              # Full labeled transcript
    audioUrl: Optional[str] = ""                # Cloudinary public URL

class ListeningQuestionSchema(BaseModel):
    index: int                                  # 1-40
    sectionIndex: Optional[int] = 0             # 0-3
    type: Optional[str] = "sentence_completion" # "mcq" | "matching" | "sentence_completion" | "short_answer"
    text: Optional[str] = ""                    # Question stem
    options: Optional[List[Any]] = None         # For MCQ / matching
    matchingPairs: Optional[Any] = None         # For matching: dict or list of pairs
    correctAnswer: Optional[Any] = ""           # "B" or "September" or "Room 204"
    explanation: Optional[str] = None

class ListeningTestGenerateResponse(BaseModel):
    id: Optional[str] = None
    title: Optional[str] = "IELTS Academic Listening Test"
    difficulty: Optional[str] = "mixed"
    sections: List[ListeningSectionSchema] = []
    questions: List[ListeningQuestionSchema] = []
    audioUrls: Optional[Dict[str, str]] = {}    # { "0": "https://...", ... }
    transcripts: Optional[Dict[str, str]] = {}
    topics: Optional[List[str]] = []
    totalQuestions: Optional[int] = 40

class ListeningSubmitRequest(BaseModel):
    test: ListeningTestGenerateResponse
    answers: Optional[Dict[str, str]] = None
    userAnswers: Optional[Dict[str, str]] = None
    timeTakenSeconds: Optional[int] = 0

class QuestionResultSchema(BaseModel):
    index: int
    sectionIndex: int = 0
    type: str = "sentence_completion"
    text: str = ""
    userAnswer: str = ""
    correctAnswer: str = ""
    isCorrect: bool = False
    explanation: Optional[str] = None

class SectionScoreSchema(BaseModel):
    sectionIndex: int
    correct: int
    total: int
    difficulty: str

class QuestionTypeScoreSchema(BaseModel):
    type: str
    label: str
    correct: int
    total: int
    percentage: float = 0.0

class ListeningSubmitResponse(BaseModel):
    score: int
    bandScore: float
    accuracy: float
    timeTakenSeconds: int
    sectionScores: List[SectionScoreSchema]
    questionTypeScores: List[QuestionTypeScoreSchema]
    questionResults: List[QuestionResultSchema]
    recommendations: List[str]
