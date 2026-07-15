// "use client"

// // components/writing/task2-prompt.tsx

// import type { Task2Question } from "@/lib/writing-types"

// const ESSAY_TYPE_LABELS: Record<string, string> = {
//   opinion: "Opinion — Agree / Disagree",
//   discussion: "Discussion — Both Views",
//   advantage_disadvantage: "Advantage / Disadvantage",
//   problem_solution: "Problem / Solution",
//   two_part: "Two-Part Question",
// }

// interface Task2PromptProps {
//   question: Task2Question
// }

// export function Task2Prompt({ question }: Task2PromptProps) {
//   return (
//     <div className="bg-card border border-border rounded-2xl overflow-hidden">
//       <div className="px-5 py-3 border-b border-border bg-muted/30">
//         <div className="flex items-center justify-between">
//           <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//             Task 2 — Essay
//           </span>
//           <span className="text-xs text-muted-foreground">Min. 250 words · ~40 min</span>
//         </div>
//       </div>

//       <div className="p-5 space-y-4">
//         {/* Essay type badge */}
//         <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
//           {ESSAY_TYPE_LABELS[question.essay_type] ?? question.essay_type}
//         </span>

//         {/* Question */}
//         <p className="text-sm text-foreground leading-relaxed">
//           {question.prompt_text}
//         </p>

//         {/* Structure reminder */}
//         <div className="space-y-1.5">
//           <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
//             Suggested Structure
//           </p>
//           {["Introduction — paraphrase + thesis", "Body Paragraph 1 — main idea + example", "Body Paragraph 2 — main idea + example", "Conclusion — summarise + restate position"].map((s, i) => (
//             <div key={i} className="flex items-center gap-2">
//               <div className="w-4 h-4 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
//                 {i + 1}
//               </div>
//               <p className="text-xs text-muted-foreground">{s}</p>
//             </div>
//           ))}
//         </div>

//         {/* Tip */}
//         <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
//           <p className="text-xs text-amber-600 dark:text-amber-400">
//             <strong>Tip:</strong> Do NOT use contractions (don't → do not) or bullet points. State your position clearly and maintain it throughout.
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }























"use client"

// components/writing/task2-prompt.tsx

import { PenSquare, Clock, ClipboardList, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Task2Question } from "@/lib/writing-types"

const ESSAY_TYPE_LABELS: Record<string, string> = {
  opinion: "Opinion — Agree / Disagree",
  discussion: "Discussion — Both Views",
  advantage_disadvantage: "Advantage / Disadvantage",
  problem_solution: "Problem / Solution",
  two_part: "Two-Part Question",
}

const STRUCTURE = [
  "Introduction — paraphrase + thesis",
  "Body Paragraph 1 — main idea + example",
  "Body Paragraph 2 — main idea + example",
  "Conclusion — summarise + restate position",
]

const WRITING_TIPS = [
  "Do not use contractions",
  "State your position clearly",
  "Maintain your position throughout",
  "Avoid bullet points and note form",
]

interface Task2PromptProps {
  question: Task2Question
  wordCount?: number
}

export function Task2Prompt({ question, wordCount = 0 }: Task2PromptProps) {
  const minimum = 250
  const remaining = Math.max(0, minimum - wordCount)
  const pct = Math.min(Math.round((wordCount / minimum) * 100), 100)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5 space-y-5">

        {/* ── Meta row ── */}
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <PenSquare className="w-3 h-3" />
            ESSAY
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ~40 minutes recommended
          </span>
        </div>

        {/* ── Title ── */}
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          TASK 2 — ESSAY WRITING
        </h1>

        {/* ── Instruction box ── */}
        <div className="flex items-start gap-3 bg-muted/50 rounded-xl px-4 py-3">
          <ClipboardList className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">
            You should spend about 40 minutes on this task. Write at least {minimum} words.
          </p>
        </div>

        {/* ── Essay type badge ── */}
        <span className="inline-block text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full">
          {ESSAY_TYPE_LABELS[question.essay_type] ?? question.essay_type}
        </span>

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

        {/* ── Suggested structure ── */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Suggested Structure
          </p>
          {STRUCTURE.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">
                {i + 1}
              </div>
              <p className="text-xs text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>

        {/* ── Writing tips ── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            Writing Tips
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {WRITING_TIPS.map((tip, i) => (
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
