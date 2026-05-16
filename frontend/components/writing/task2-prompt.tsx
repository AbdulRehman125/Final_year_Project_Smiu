"use client"

// components/writing/task2-prompt.tsx

import type { Task2Question } from "@/lib/writing-types"

const ESSAY_TYPE_LABELS: Record<string, string> = {
  opinion: "Opinion — Agree / Disagree",
  discussion: "Discussion — Both Views",
  advantage_disadvantage: "Advantage / Disadvantage",
  problem_solution: "Problem / Solution",
  two_part: "Two-Part Question",
}

interface Task2PromptProps {
  question: Task2Question
}

export function Task2Prompt({ question }: Task2PromptProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Task 2 — Essay
          </span>
          <span className="text-xs text-muted-foreground">Min. 250 words · ~40 min</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Essay type badge */}
        <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
          {ESSAY_TYPE_LABELS[question.essay_type] ?? question.essay_type}
        </span>

        {/* Question */}
        <p className="text-sm text-foreground leading-relaxed">
          {question.prompt_text}
        </p>

        {/* Structure reminder */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Suggested Structure
          </p>
          {["Introduction — paraphrase + thesis", "Body Paragraph 1 — main idea + example", "Body Paragraph 2 — main idea + example", "Conclusion — summarise + restate position"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-xs text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <strong>Tip:</strong> Do NOT use contractions (don't → do not) or bullet points. State your position clearly and maintain it throughout.
          </p>
        </div>
      </div>
    </div>
  )
}
