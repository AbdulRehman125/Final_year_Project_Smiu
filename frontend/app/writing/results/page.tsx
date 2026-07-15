// "use client"

// // app/writing/results/page.tsx

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { RotateCcw, TrendingUp, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { BandCircle } from "@/components/writing/band-circle"
// import { CriterionRow } from "@/components/writing/criterion-row"
// import { ErrorList } from "@/components/writing/error-list"
// import { cn } from "@/lib/utils"
// import { bandToLabel, bandToColor, type WritingEvaluationResponse } from "@/lib/writing-types"

// export default function ResultsPage() {
//   const router = useRouter()
//   const [results, setResults] = useState<WritingEvaluationResponse | null>(null)
//   const [expandedTask, setExpandedTask] = useState<1 | 2 | null>(1)

//   useEffect(() => {
//     const stored = sessionStorage.getItem("ielts_results")
//     if (!stored) { router.push("/writing"); return }
//     setResults(JSON.parse(stored))
//   }, [router])

//   if (!results) return null

//   const { task1_score, task2_score, overall_writing_band, summary, strengths, improvements } = results

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="max-w-3xl mx-auto px-4 py-10">

//         {/* ── Overall Score Hero ── */}
//         <div className="text-center mb-10">
//           <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
//             Your IELTS Writing Score
//           </p>
//           <BandCircle band={overall_writing_band} size="lg" />
//           <p className={cn("text-xl font-semibold mt-3", bandToColor(overall_writing_band))}>
//             {bandToLabel(overall_writing_band)}
//           </p>
//           <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
//             {summary}
//           </p>
//         </div>

//         {/* ── Task Scores ── */}
//         <div className="space-y-4 mb-8">
//           {([
//             { num: 1 as const, score: task1_score, label: "Task 1", weight: "33%" },
//             { num: 2 as const, score: task2_score, label: "Task 2", weight: "67%" },
//           ]).map(({ num, score, label, weight }) => (
//             <div key={num} className="bg-card border border-border rounded-2xl overflow-hidden">

//               {/* Task Header — clickable */}
//               <button
//                 className="w-full px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
//                 onClick={() => setExpandedTask(expandedTask === num ? null : num)}
//               >
//                 <BandCircle band={score.overall_band} size="sm" />
//                 <div className="flex-1 text-left">
//                   <div className="font-semibold text-foreground">{label}</div>
//                   <div className="text-xs text-muted-foreground">
//                     {score.word_count} words · Weight: {weight}
//                     {!score.word_count_sufficient && (
//                       <span className="ml-2 text-amber-500 font-medium">⚠ Under minimum</span>
//                     )}
//                   </div>
//                 </div>
//                 {expandedTask === num
//                   ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
//                   : <ChevronDown className="w-4 h-4 text-muted-foreground" />
//                 }
//               </button>

//               {/* Expanded Content */}
//               {expandedTask === num && (
//                 <div className="px-6 pb-6 border-t border-border pt-4 space-y-4">

//                   {/* 4 Criteria */}
//                   <div className="space-y-2">
//                     <CriterionRow
//                       label={num === 1 ? "Task Achievement" : "Task Response"}
//                       band={score.band_task_achievement}
//                       feedback={score.feedback_task_achievement}
//                     />
//                     <CriterionRow
//                       label="Coherence & Cohesion"
//                       band={score.band_coherence_cohesion}
//                       feedback={score.feedback_coherence_cohesion}
//                     />
//                     <CriterionRow
//                       label="Lexical Resource"
//                       band={score.band_lexical_resource}
//                       feedback={score.feedback_lexical_resource}
//                     />
//                     <CriterionRow
//                       label="Grammatical Range & Accuracy"
//                       band={score.band_grammatical_range}
//                       feedback={score.feedback_grammatical_range}
//                     />
//                   </div>

//                   {/* Errors */}
//                   {score.errors.length > 0 && (
//                     <ErrorList errors={score.errors} />
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* ── Strengths & Improvements ── */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
//           {strengths.length > 0 && (
//             <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <CheckCircle className="w-4 h-4 text-emerald-500" />
//                 <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Strengths</h3>
//               </div>
//               <ul className="space-y-2">
//                 {strengths.map((s, i) => (
//                   <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
//                     <span className="text-emerald-500 mt-0.5">•</span>
//                     {s}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {improvements.length > 0 && (
//             <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
//               <div className="flex items-center gap-2 mb-3">
//                 <TrendingUp className="w-4 h-4 text-amber-500" />
//                 <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">To Improve</h3>
//               </div>
//               <ul className="space-y-2">
//                 {improvements.map((s, i) => (
//                   <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
//                     <span className="text-amber-500 mt-0.5">•</span>
//                     {s}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* ── Actions ── */}
//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             className="flex-1 h-12 rounded-xl"
//             onClick={() => { sessionStorage.clear(); router.push("/writing") }}
//           >
//             <RotateCcw className="w-4 h-4 mr-2" />
//             Try Again
//           </Button>
//           <Button
//             className="flex-1 h-12 rounded-xl"
//             onClick={() => router.push("/")}
//           >
//             Back to Dashboard
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }




















"use client"

// app/writing/results/page.tsx

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  RotateCcw,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BandCircle } from "@/components/writing/band-circle"
import { CriterionRow } from "@/components/writing/criterion-row"
import { ErrorList } from "@/components/writing/error-list"
import { AiDetectionCard } from "@/components/writing/ai-detection-card"
import { cn } from "@/lib/utils"
import { bandToLabel, bandToColor, type WritingEvaluationResponse } from "@/lib/writing-types"

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<WritingEvaluationResponse | null>(null)
  const [expandedTask, setExpandedTask] = useState<1 | 2 | null>(1)

  useEffect(() => {
    const stored = sessionStorage.getItem("ielts_results")
    if (!stored) { router.push("/writing"); return }
    setResults(JSON.parse(stored))
  }, [router])

  if (!results) return null

  const {
    task1_score,
    task2_score,
    overall_writing_band,
    summary,
    strengths,
    improvements,
    test_type,
    time_taken_seconds,
    ai_detection,
  } = results

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">

        {/* ── Overall Score Hero ── */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-5">
            Your IELTS Writing Score
          </p>

          <BandCircle band={overall_writing_band} size="lg" />

          <p className={cn("text-xl font-semibold mt-4", bandToColor(overall_writing_band))}>
            {bandToLabel(overall_writing_band)}
          </p>

          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            {summary}
          </p>

          {/* Metadata row */}
          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted capitalize">
              <FileText className="w-3.5 h-3.5" />
              {test_type} Test
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(time_taken_seconds)}
            </span>
          </div>
        </div>

        {/* ── Task Scores ── */}
        <div className="space-y-4 mb-4">
          {([
            { num: 1 as const, score: task1_score, label: "Task 1", weight: "33%" },
            { num: 2 as const, score: task2_score, label: "Task 2", weight: "67%" },
          ]).map(({ num, score, label, weight }) => (
            <div
              key={num}
              className="bg-card border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* Task Header — clickable */}
              <button
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedTask(expandedTask === num ? null : num)}
              >
                <BandCircle band={score.overall_band} size="sm" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">
                    {score.word_count} words · Weight: {weight}
                    {!score.word_count_sufficient && (
                      <span className="ml-2 text-amber-500 font-medium">⚠ Under minimum</span>
                    )}
                  </div>
                </div>
                {expandedTask === num
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                }
              </button>

              {/* Expanded Content */}
              {expandedTask === num && (
                <div className="px-6 pb-6 border-t border-border pt-4 space-y-4">

                  {/* 4 Criteria */}
                  <div className="space-y-2">
                    <CriterionRow
                      label={num === 1 ? "Task Achievement" : "Task Response"}
                      band={score.band_task_achievement}
                      feedback={score.feedback_task_achievement}
                    />
                    <CriterionRow
                      label="Coherence & Cohesion"
                      band={score.band_coherence_cohesion}
                      feedback={score.feedback_coherence_cohesion}
                    />
                    <CriterionRow
                      label="Lexical Resource"
                      band={score.band_lexical_resource}
                      feedback={score.feedback_lexical_resource}
                    />
                    <CriterionRow
                      label="Grammatical Range & Accuracy"
                      band={score.band_grammatical_range}
                      feedback={score.feedback_grammatical_range}
                    />
                  </div>

                  {/* Errors */}
                  {score.errors.length > 0 && (
                    <ErrorList errors={score.errors} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Authenticity Check (AI-detection) ── */}
        {ai_detection && (
          <div className="mb-8">
            <AiDetectionCard data={ai_detection} />
          </div>
        )}

        {/* ── Strengths & Improvements ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {strengths.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">To Improve</h3>
              </div>
              <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => { sessionStorage.clear(); router.push("/writing") }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl"
            onClick={() => router.push("/")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}