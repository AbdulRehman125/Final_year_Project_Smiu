from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class ListeningSectionSchema(BaseModel):
    index: int                    # 0-3
    title: str                    # "Section 1: Booking Accommodation"
    description: str              # Context description
    difficulty: str               # "easy" | "moderate" | "hard"
    speakers: int                 # 1 or 2-3
    speakerNames: List[str]       # ["Sarah", "Receptionist"]
    durationMinutes: float        # ~7.0
    questionRange: List[int]      # [1, 10]
    transcript: str               # Full labeled transcript
    audioUrl: str = ""            # Cloudinary public URL

class ListeningQuestionSchema(BaseModel):
    index: int                    # 1-40
    sectionIndex: int             # 0-3
    type: str                     # "mcq" | "matching" | "sentence_completion" | "short_answer"
    text: str                     # Question stem
    options: Optional[List[Any]] = None  # For MCQ / matching
    matchingPairs: Optional[Any] = None # For matching: dict or list of pairs
    correctAnswer: Any            # "B" or "September" or "Room 204"
    explanation: Optional[str] = None

class ListeningTestGenerateResponse(BaseModel):
    title: str
    difficulty: str
    sections: List[ListeningSectionSchema]
    questions: List[ListeningQuestionSchema]
    audioUrls: Dict[str, str]     # { "0": "https://...", ... }
    transcripts: Dict[str, str]
    topics: List[str]
    totalQuestions: int

class ListeningSubmitRequest(BaseModel):
    test: ListeningTestGenerateResponse
    answers: Dict[str, str]
    timeTakenSeconds: int

class QuestionResultSchema(BaseModel):
    index: int
    sectionIndex: int
    type: str
    text: str
    userAnswer: str
    correctAnswer: str
    isCorrect: bool
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

class ListeningSubmitResponse(BaseModel):
    score: int
    bandScore: float
    accuracy: float
    timeTakenSeconds: int
    sectionScores: List[SectionScoreSchema]
    questionTypeScores: List[QuestionTypeScoreSchema]
    questionResults: List[QuestionResultSchema]
    recommendations: List[str]
