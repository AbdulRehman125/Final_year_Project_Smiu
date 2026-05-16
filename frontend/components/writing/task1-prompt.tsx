"use client"

// components/writing/task1-prompt.tsx

import Image from "next/image"
import type { Task1Question, TestType } from "@/lib/writing-types"

interface Task1PromptProps {
  question: Task1Question
  testType: TestType
}

export function Task1Prompt({ question, testType }: Task1PromptProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Task 1 — {testType === "academic" ? "Academic Report" : "Letter"}
          </span>
          <span className="text-xs text-muted-foreground">Min. 150 words · ~20 min</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Prompt text */}
        <p className="text-sm text-foreground leading-relaxed">
          {question.prompt_text}
        </p>

        {/* Chart image — Academic only */}
        {testType === "academic" && question.image_url && (
          <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
            <img
              src={question.image_url}
              alt="Chart for Task 1"
              className="w-full h-auto object-contain max-h-64"
            />
          </div>
        )}

        {/* Tip */}
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Tip:</strong>{" "}
            {testType === "academic"
              ? "Start with an overview of the main trend. Do not give your opinion or write a conclusion."
              : "Match your letter style (formal/informal) to the situation described."}
          </p>
        </div>
      </div>
    </div>
  )
}
