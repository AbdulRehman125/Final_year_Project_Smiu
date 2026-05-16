// // lib/writing-types.ts
// // Shared types for Writing Module

// export type TestType = "academic" | "general"

// export type Task1ChartType =
//   | "line_graph"
//   | "bar_chart"
//   | "pie_chart"
//   | "table"
//   | "process_diagram"
//   | "map"
//   | "mixed"

// export type Task2EssayType =
//   | "opinion"
//   | "discussion"
//   | "advantage_disadvantage"
//   | "problem_solution"
//   | "two_part"

// export interface Task1Question {
//   id: string
//   chart_type: Task1ChartType
//   image_url: string
//   prompt_text: string
//   description: string
// }

// export interface Task2Question {
//   id: string
//   essay_type: Task2EssayType
//   prompt_text: string
// }

// export interface WritingError {
//   error_type: "grammar" | "vocabulary" | "coherence" | "task"
//   original: string
//   correction: string
//   rule: string
//   position?: string
// }

// export interface TaskScore {
//   band_task_achievement: number
//   band_coherence_cohesion: number
//   band_lexical_resource: number
//   band_grammatical_range: number
//   overall_band: number
//   feedback_task_achievement: string
//   feedback_coherence_cohesion: string
//   feedback_lexical_resource: string
//   feedback_grammatical_range: string
//   errors: WritingError[]
//   word_count: number
//   word_count_sufficient: boolean
//   strengths: string[]
//   improvements: string[]
// }

// export interface WritingEvaluationResponse {
//   task1_score: TaskScore
//   task2_score: TaskScore
//   overall_writing_band: number
//   test_type: TestType
//   time_taken_seconds: number
//   summary: string
//   strengths: string[]
//   improvements: string[]
// }

// // ── API Client ──────────────────────────────────

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// export async function evaluateWriting(payload: {
//   test_type: TestType
//   task1_question: Task1Question
//   task2_question: Task2Question
//   task1_response: string
//   task2_response: string
//   time_taken_seconds: number
// }): Promise<WritingEvaluationResponse> {
//   const res = await fetch(`${BACKEND_URL}/api/writing/evaluate`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   })
//   if (!res.ok) throw new Error("Evaluation failed")
//   return res.json()
// }

// // ── Sample Questions (until DB is ready) ────────

// export const SAMPLE_TASK1_ACADEMIC: Task1Question = {
//   id: "t1_001",
//   chart_type: "bar_chart",
//   image_url: "https://ieltsliz.com/wp-content/uploads/2014/03/bar-chart-ielts.jpg",
//   prompt_text:
//     "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
//   description:
//     "Bar chart showing owned vs rented accommodation percentages in England and Wales from 1918 to 2011.",
// }

// export const SAMPLE_TASK2: Task2Question = {
//   id: "t2_001",
//   essay_type: "opinion",
//   prompt_text:
//     "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree with this statement? Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
// }

// // Band to label
// export function bandToLabel(band: number): string {
//   if (band >= 9) return "Expert"
//   if (band >= 8) return "Very Good"
//   if (band >= 7) return "Good"
//   if (band >= 6) return "Competent"
//   if (band >= 5) return "Modest"
//   if (band >= 4) return "Limited"
//   return "Extremely Limited"
// }

// // Band to color class
// export function bandToColor(band: number): string {
//   if (band >= 7) return "text-emerald-400"
//   if (band >= 6) return "text-blue-400"
//   if (band >= 5) return "text-amber-400"
//   return "text-red-400"
// }








// lib/writing-types.ts

export type TestType = "academic" | "general"

export type Task1ChartType =
  | "line_graph" | "bar_chart" | "pie_chart"
  | "table" | "process_diagram" | "map" | "letter"

export type Task2EssayType =
  | "opinion" | "discussion" | "advantage_disadvantage"
  | "problem_solution" | "two_part"

export interface Task1Question {
  id: string
  chart_type: Task1ChartType
  image_url: string
  prompt_text: string
  description: string
  test_type: string
}

export interface Task2Question {
  id: string
  essay_type: Task2EssayType
  prompt_text: string
}

export interface GeneratedWritingQuestions {
  test_type: TestType
  task1: Task1Question
  task2: Task2Question
}

export interface WritingError {
  error_type: "grammar" | "vocabulary" | "coherence" | "task"
  original: string
  correction: string
  rule: string
  position?: string
}

export interface TaskScore {
  band_task_achievement: number
  band_coherence_cohesion: number
  band_lexical_resource: number
  band_grammatical_range: number
  overall_band: number
  feedback_task_achievement: string
  feedback_coherence_cohesion: string
  feedback_lexical_resource: string
  feedback_grammatical_range: string
  errors: WritingError[]
  word_count: number
  word_count_sufficient: boolean
  strengths: string[]
  improvements: string[]
}

export interface WritingEvaluationResponse {
  task1_score: TaskScore
  task2_score: TaskScore
  overall_writing_band: number
  test_type: TestType
  time_taken_seconds: number
  summary: string
  strengths: string[]
  improvements: string[]
}

// ── API Base URL ────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// ── Fetch Questions from LLM Agent ─────────────

export async function fetchWritingQuestions(
  testType: TestType
): Promise<GeneratedWritingQuestions> {
  const res = await fetch(
    `${BACKEND_URL}/api/questions/generate?test_type=${testType}`,
    { cache: "no-store" }   // Always fresh — no caching
  )
  if (!res.ok) throw new Error("Failed to generate questions")
  return res.json()
}

// ── Submit for Evaluation ───────────────────────

export async function evaluateWriting(payload: {
  test_type: TestType
  task1_question: Task1Question
  task2_question: Task2Question
  task1_response: string
  task2_response: string
  time_taken_seconds: number
}): Promise<WritingEvaluationResponse> {
  const res = await fetch(`${BACKEND_URL}/api/writing/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Evaluation failed")
  return res.json()
}

// ── Helpers ─────────────────────────────────────

export function bandToLabel(band: number): string {
  if (band >= 9) return "Expert"
  if (band >= 8) return "Very Good"
  if (band >= 7) return "Good"
  if (band >= 6) return "Competent"
  if (band >= 5) return "Modest"
  if (band >= 4) return "Limited"
  return "Extremely Limited"
}

export function bandToColor(band: number): string {
  if (band >= 7) return "text-emerald-400"
  if (band >= 6) return "text-blue-400"
  if (band >= 5) return "text-amber-400"
  return "text-red-400"
}
