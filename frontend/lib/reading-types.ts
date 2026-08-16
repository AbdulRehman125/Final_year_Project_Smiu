// frontend/lib/reading-types.ts — TypeScript types & API client helpers for Reading module

export type QuestionType =
  | "mcq"
  | "true_false_not_given"
  | "sentence_completion"
  | "short_answer"
  | "matching_headings";

export interface ReadingParagraph {
  label: string; // "A", "B", "C", etc.
  text: string;
}

export interface ReadingPassage {
  index: number; // 0, 1, 2
  title: string;
  difficulty: "easy" | "moderate" | "hard";
  topic: string;
  paragraphs: ReadingParagraph[];
  questionRange: [number, number]; // e.g. [1, 13]
}

export interface ReadingQuestion {
  index: number; // 1-40
  passageIndex: number; // 0, 1, 2
  type: QuestionType;
  text: string;
  options?: string[]; // For MCQ e.g. ["A. Reducing costs", "B. Improving accuracy"]
  correctAnswer: string;
  explanation?: string;
  paragraphRef?: string; // "B"
}

export interface ReadingTest {
  id?: string;
  title: string;
  difficulty: string;
  passages: ReadingPassage[];
  questions: ReadingQuestion[];
  topics: string[];
  totalQuestions: number;
}

export interface PassageScore {
  passageIndex: number;
  difficulty: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface QuestionTypeScore {
  type: string;
  label: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface QuestionResult {
  index: number;
  passageIndex: number;
  type: string;
  text: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  paragraphRef?: string;
}

export interface ReadingEvaluationResponse {
  score: number; // out of 40
  bandScore: number; // 1.0 - 9.0
  accuracy: number; // percentage
  timeTakenSeconds: number;
  passageScores: PassageScore[];
  questionTypeScores: QuestionTypeScore[];
  questionResults: QuestionResult[];
  recommendations: string[];
}

export interface ReadingSubmitPayload {
  answers?: Record<string, string>; // question index string -> answer
  userAnswers?: Record<string, string>;
  timeTakenSeconds: number;
  test: ReadingTest;
}

// ── Band score conversion helper ──────────────────────────────────────────
export function bandFromRawScore(rawScore: number): number {
  if (rawScore >= 39) return 9.0;
  if (rawScore >= 37) return 8.5;
  if (rawScore >= 35) return 8.0;
  if (rawScore >= 33) return 7.5;
  if (rawScore >= 30) return 7.0;
  if (rawScore >= 27) return 6.5;
  if (rawScore >= 23) return 6.0;
  if (rawScore >= 19) return 5.5;
  if (rawScore >= 15) return 5.0;
  if (rawScore >= 13) return 4.5;
  if (rawScore >= 10) return 4.0;
  if (rawScore >= 6) return 3.5;
  if (rawScore >= 4) return 3.0;
  return 2.5;
}

export function bandToLabel(band: number): string {
  if (band >= 8.5) return "Expert";
  if (band >= 7.5) return "Very Good";
  if (band >= 6.5) return "Competent";
  if (band >= 5.5) return "Modest";
  if (band >= 4.5) return "Limited";
  return "Developing";
}

export function bandToColor(band: number): string {
  if (band >= 7.5) return "text-emerald-600 dark:text-emerald-400";
  if (band >= 6.5) return "text-blue-600 dark:text-blue-400";
  if (band >= 5.5) return "text-amber-600 dark:text-amber-400";
  if (band >= 4.5) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

// ── API Client Functions ──────────────────────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function generateReadingTest(): Promise<ReadingTest> {
  const res = await fetch(`${BACKEND_URL}/api/reading/generate`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to generate reading test: ${res.statusText}`);
  }
  return res.json();
}

export async function evaluateReadingTest(
  payload: ReadingSubmitPayload
): Promise<ReadingEvaluationResponse> {
  const res = await fetch(`${BACKEND_URL}/api/reading/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to evaluate reading test: ${res.statusText}`);
  }
  return res.json();
}
