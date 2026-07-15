"use client"

// components/writing/ai-detection-card.tsx
// Authenticity / AI-content detection section for the results page.
//
// Design intent: this is a forensic/analytical signal, not encouragement
// or criticism — so it gets its own visual language (a severity-coded
// badge + shield icon) rather than reusing the emerald/amber "strengths
// vs improvements" palette, to avoid implying a pass/fail grade.

import { useState } from "react"
import { ShieldCheck, ShieldAlert, ShieldQuestion, ChevronDown, ChevronUp, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WritingAIDetection, AIDetectionResult } from "@/lib/writing-types"

const LIKELIHOOD_CONFIG = {
  low: {
    label: "Likely Human-Written",
    icon: ShieldCheck,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    barClass: "bg-emerald-500",
    ringClass: "border-emerald-500/20",
  },
  medium: {
    label: "Some AI-Writing Signals",
    icon: ShieldAlert,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    barClass: "bg-amber-500",
    ringClass: "border-amber-500/20",
  },
  high: {
    label: "Strong AI-Writing Signals",
    icon: ShieldAlert,
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    barClass: "bg-red-500",
    ringClass: "border-red-500/20",
  },
} as const

function TaskDetail({ label, result }: { label: string; result: AIDetectionResult }) {
  const config = LIKELIHOOD_CONFIG[result.likelihood]
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", config.badgeClass)}>
          {config.label}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{result.reasoning}</p>
      {result.indicators.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.indicators.map((ind, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-md bg-background border border-border text-muted-foreground"
            >
              {ind}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function AiDetectionCard({ data }: { data: WritingAIDetection }) {
  const [expanded, setExpanded] = useState(false)
  const config = LIKELIHOOD_CONFIG[data.overall_likelihood]
  const Icon = config.icon
  const confidencePct = Math.round(data.overall_confidence_score * 100)

  return (
    <div className={cn("bg-card border rounded-2xl overflow-hidden", config.ringClass)}>
      <button
        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={cn("shrink-0 w-10 h-10 rounded-full flex items-center justify-center border", config.badgeClass)}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Authenticity Check</span>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", config.badgeClass)}>
              {config.label}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 max-w-[160px] rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", config.barClass)}
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{confidencePct}% confidence</span>
          </div>
        </div>

        {expanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-border pt-4 space-y-3">
          <TaskDetail label="Task 1" result={data.task1} />
          <TaskDetail label="Task 2" result={data.task2} />

          <div className="flex items-start gap-2 pt-1">
            <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is an automated, probabilistic signal based on writing style patterns —
              not a definitive verdict. High-proficiency human writing can occasionally
              score higher on this check, and it should be used to inform review, not
              replace it.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}






















// "use client"

// import { useState } from "react"
// import {
//   ShieldCheck,
//   ShieldAlert,
//   ChevronDown,
//   ChevronUp,
//   Info,
// } from "lucide-react"

// import { cn } from "@/lib/utils"
// import type {
//   WritingAIDetection,
//   AIDetectionResult,
//   AILikelihood,
// } from "@/lib/writing-types"

// const LIKELIHOOD_CONFIG: Record<
//   AILikelihood,
//   {
//     label: string
//     icon: typeof ShieldCheck
//     badgeClass: string
//     barClass: string
//     ringClass: string
//   }
// > = {
//   low: {
//     label: "Likely Human-Written",
//     icon: ShieldCheck,
//     badgeClass:
//       "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
//     barClass: "bg-emerald-500",
//     ringClass: "border-emerald-500/20",
//   },
//   medium: {
//     label: "Some AI-Writing Signals",
//     icon: ShieldAlert,
//     badgeClass:
//       "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
//     barClass: "bg-amber-500",
//     ringClass: "border-amber-500/20",
//   },
//   high: {
//     label: "Strong AI-Writing Signals",
//     icon: ShieldAlert,
//     badgeClass:
//       "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
//     barClass: "bg-red-500",
//     ringClass: "border-red-500/20",
//   },
// }

// function TaskDetail({
//   label,
//   result,
// }: {
//   label: string
//   result: AIDetectionResult
// }) {
//   const config = LIKELIHOOD_CONFIG[result.likelihood]

//   return (
//     <div className="rounded-xl border border-border bg-muted/30 p-4">
//       <div className="mb-2 flex items-center justify-between">
//         <span className="text-sm font-medium text-foreground">
//           {label}
//         </span>

//         <span
//           className={cn(
//             "rounded-full border px-2 py-0.5 text-xs font-medium",
//             config.badgeClass
//           )}
//         >
//           {config.label}
//         </span>
//       </div>

//       <p className="mb-3 text-sm text-muted-foreground">
//         {result.reasoning}
//       </p>

//       {(result.indicators?.length ?? 0) > 0 && (
//         <div className="flex flex-wrap gap-1.5">
//           {result.indicators.map((indicator) => (
//             <span
//               key={indicator}
//               className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
//             >
//               {indicator}
//             </span>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// export function AiDetectionCard({
//   data,
// }: {
//   data: WritingAIDetection
// }) {
//   const [expanded, setExpanded] = useState(false)

//   const config = LIKELIHOOD_CONFIG[data.overall_likelihood]

//   const Icon = config.icon

//   const confidencePct = Math.round(
//     (data.overall_confidence_score ?? 0) * 100
//   )

//   return (
//     <div
//       className={cn(
//         "overflow-hidden rounded-2xl border bg-card",
//         config.ringClass
//       )}
//     >
//       <button
//         type="button"
//         onClick={() => setExpanded((v) => !v)}
//         className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/30"
//       >
//         <div
//           className={cn(
//             "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
//             config.badgeClass
//           )}
//         >
//           <Icon className="h-5 w-5" />
//         </div>

//         <div className="min-w-0 flex-1">
//           <div className="flex items-center gap-2">
//             <span className="font-semibold text-foreground">
//               Authenticity Check
//             </span>

//             <span
//               className={cn(
//                 "rounded-full border px-2 py-0.5 text-xs font-medium",
//                 config.badgeClass
//               )}
//             >
//               {config.label}
//             </span>
//           </div>

//           <div className="mt-2 flex items-center gap-2">
//             <div className="h-1.5 max-w-[160px] flex-1 overflow-hidden rounded-full bg-muted">
//               <div
//                 className={cn(
//                   "h-full rounded-full transition-all",
//                   config.barClass
//                 )}
//                 style={{
//                   width: `${confidencePct}%`,
//                 }}
//               />
//             </div>

//             <span className="tabular-nums text-xs text-muted-foreground">
//               {confidencePct}% confidence
//             </span>
//           </div>
//         </div>

//         {expanded ? (
//           <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
//         ) : (
//           <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
//         )}
//       </button>

//       {expanded && (
//         <div className="space-y-3 border-t border-border px-6 pb-6 pt-4">
//           <TaskDetail
//             label="Task 1"
//             result={data.task1}
//           />

//           <TaskDetail
//             label="Task 2"
//             result={data.task2}
//           />

//           <div className="flex items-start gap-2 pt-1">
//             <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

//             <p className="text-xs leading-relaxed text-muted-foreground">
//               This is an automated, probabilistic signal based on writing
//               style patterns—not a definitive verdict. High-quality human
//               writing can sometimes receive higher AI scores. Use this as
//               one review signal rather than a final judgment.
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }