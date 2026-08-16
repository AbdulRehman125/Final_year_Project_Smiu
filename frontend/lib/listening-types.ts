"use client";

export type ListeningQuestionType = "mcq" | "matching" | "sentence_completion" | "short_answer";

export interface ListeningSection {
  index: number;
  title: string;
  description: string;
  difficulty: "easy" | "moderate" | "hard";
  speakers: number;
  speakerNames: string[];
  durationMinutes: number;
  questionRange: [number, number];
  transcript: string;
  audioUrl: string;
}

export interface ListeningQuestion {
  index: number;
  sectionIndex: number;
  type: ListeningQuestionType;
  text: string;
  options?: string[];
  matchingPairs?: { persons: string[]; options: string[] };
  correctAnswer: string;
  explanation?: string;
}

export interface ListeningTest {
  id?: string;
  title: string;
  difficulty: string;
  sections: ListeningSection[];
  questions: ListeningQuestion[];
  audioUrls: Record<string, string>;
  transcripts: Record<string, string>;
  topics: string[];
  totalQuestions: number;
}

export interface SectionScore {
  sectionIndex: number;
  correct: number;
  total: number;
  difficulty: string;
}

export interface QuestionTypeScore {
  type: string;
  label: string;
  correct: number;
  total: number;
  percentage?: number;
}

export interface QuestionResult {
  index: number;
  sectionIndex: number;
  type: string;
  text: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface ListeningEvaluationResponse {
  score: number;
  bandScore: number;
  accuracy: number;
  timeTakenSeconds: number;
  sectionScores: SectionScore[];
  questionTypeScores: QuestionTypeScore[];
  questionResults: QuestionResult[];
  recommendations: string[];
}

export interface ListeningSubmitPayload {
  answers?: Record<string, string>;
  userAnswers?: Record<string, string>;
  timeTakenSeconds: number;
  test: ListeningTest;
}

// Band conversion (same as IELTS Reading/Listening)
export function bandFromRawScore(raw: number): number {
  if (raw >= 39) return 9.0;
  if (raw >= 37) return 8.5;
  if (raw >= 35) return 8.0;
  if (raw >= 33) return 7.5;
  if (raw >= 30) return 7.0;
  if (raw >= 27) return 6.5;
  if (raw >= 23) return 6.0;
  if (raw >= 20) return 5.5;
  if (raw >= 16) return 5.0;
  if (raw >= 13) return 4.5;
  if (raw >= 10) return 4.0;
  if (raw >= 6) return 3.5;
  if (raw >= 4) return 3.0;
  if (raw >= 3) return 2.5;
  if (raw >= 2) return 2.0;
  if (raw >= 1) return 1.5;
  return 1.0;
}

export function bandToLabel(band: number): string {
  if (band >= 8.5) return "Expert";
  if (band >= 7.5) return "Very Good";
  if (band >= 6.5) return "Competent";
  if (band >= 5.5) return "Modest";
  if (band >= 4.5) return "Limited";
  if (band >= 3.5) return "Extremely Limited";
  return "Non User";
}

export function bandToColor(band: number): string {
  if (band >= 7.0) return "text-emerald-500";
  if (band >= 5.5) return "text-amber-500";
  return "text-red-500";
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function generateListeningTest(): Promise<ListeningTest> {
  const res = await fetch(`${BACKEND_URL}/api/listening/generate`);
  if (!res.ok) throw new Error(`Failed to generate listening test: ${res.statusText}`);
  return res.json();
}

export async function evaluateListeningTest(
  payload: ListeningSubmitPayload
): Promise<ListeningEvaluationResponse> {
  const res = await fetch(`${BACKEND_URL}/api/listening/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to evaluate listening test: ${res.statusText}`);
  return res.json();
}
