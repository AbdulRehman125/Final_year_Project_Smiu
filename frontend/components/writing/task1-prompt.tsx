// "use client"

// // components/writing/task1-prompt.tsx

// import Image from "next/image"
// import type { Task1Question, TestType } from "@/lib/writing-types"

// interface Task1PromptProps {
//   question: Task1Question
//   testType: TestType
// }

// export function Task1Prompt({ question, testType }: Task1PromptProps) {
//   return (
//     <div className="bg-card border border-border rounded-2xl overflow-hidden">
//       <div className="px-5 py-3 border-b border-border bg-muted/30">
//         <div className="flex items-center justify-between">
//           <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//             Task 1 — {testType === "academic" ? "Academic Report" : "Letter"}
//           </span>
//           <span className="text-xs text-muted-foreground">Min. 150 words · ~20 min</span>
//         </div>
//       </div>

//       <div className="p-5 space-y-4">
//         {/* Prompt text */}
//         <p className="text-sm text-foreground leading-relaxed">
//           {question.prompt_text}
//         </p>

//         {/* Chart image — Academic only */}
//         {testType === "academic" && question.image_url && (
//           <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
//             <img
//               src={question.image_url}
//               alt="Chart for Task 1"
//               className="w-full h-auto object-contain max-h-64"
//             />
//           </div>
//         )}

//         {/* Tip */}
//         <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
//           <p className="text-xs text-blue-600 dark:text-blue-400">
//             <strong>Tip:</strong>{" "}
//             {testType === "academic"
//               ? "Start with an overview of the main trend. Do not give your opinion or write a conclusion."
//               : "Match your letter style (formal/informal) to the situation described."}
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }





















"use client"

// components/writing/task1-prompt.tsx

import { FileText, Clock, ClipboardList, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChartRenderer } from "@/components/writing/chart-renderer"
import type { Task1Question, TestType } from "@/lib/writing-types"

const ACADEMIC_TIPS = [
  "Describe the overall trend first",
  "Compare key data points",
  "Use appropriate linking words",
  "Do not give your opinion",
]

const GENERAL_TIPS = [
  "Match the tone to the letter type",
  "Cover all 3 bullet points",
  "Use a suitable greeting and sign-off",
  "Keep paragraphs short and focused",
]

interface Task1PromptProps {
  question: Task1Question
  testType: TestType
  wordCount?: number
}

export function Task1Prompt({ question, testType, wordCount = 0 }: Task1PromptProps) {
  const isAcademic = testType === "academic"
  const minimum = 150
  const remaining = Math.max(0, minimum - wordCount)
  const pct = Math.min(Math.round((wordCount / minimum) * 100), 100)
  const tips = isAcademic ? ACADEMIC_TIPS : GENERAL_TIPS

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 space-y-5">

        {/* ── Meta row ── */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            {isAcademic ? "REPORT" : "LETTER"}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~20 minutes recommended
          </span>
        </div>

        {/* ── Title ── */}
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          TASK 1 — {isAcademic ? "REPORT WRITING" : "LETTER WRITING"}
        </h1>

        {/* ── Instruction box ── */}
        <div className="flex items-start gap-3 bg-muted/50 rounded-xl px-4 py-3">
          <ClipboardList className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            You should spend about 20 minutes on this task. Write at least {minimum} words.
          </p>
        </div>

        {/* ── Chart (Academic only) ── */}
        {isAcademic && question.chart_data && (
          <ChartRenderer data={question.chart_data} />
        )}

        {/* ── Question prompt ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Question Prompt
          </p>
          <div className="bg-muted/30 border border-border rounded-xl px-4 py-3">
            <p className="text-sm text-foreground leading-relaxed">
              {question.prompt_text}
            </p>
          </div>
        </div>

        {/* ── Inline word progress ── */}
        <div className="bg-muted/30 rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {remaining > 0 ? `${remaining} words remaining` : "Minimum met"}
            </span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {wordCount} / {minimum} words
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                wordCount >= minimum ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* ── Writing tips ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Writing Tips
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 bg-muted/20 rounded-lg px-3 py-2">
                <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}