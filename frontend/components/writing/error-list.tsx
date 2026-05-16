"use client"

// components/writing/error-list.tsx

import type { WritingError } from "@/lib/writing-types"

const ERROR_COLOR: Record<string, string> = {
  grammar:    "bg-red-500/10 text-red-500 border-red-500/20",
  vocabulary: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  coherence:  "bg-amber-500/10 text-amber-500 border-amber-500/20",
  task:       "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

interface ErrorListProps {
  errors: WritingError[]
}

export function ErrorList({ errors }: ErrorListProps) {
  if (!errors.length) return null

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Specific Errors Found ({errors.length})
      </h4>
      <div className="space-y-2">
        {errors.map((err, i) => (
          <div key={i} className="bg-muted/30 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ERROR_COLOR[err.error_type] ?? ERROR_COLOR.grammar}`}>
                {err.error_type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="line-through text-red-400 font-mono">{err.original}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-emerald-400 font-mono">{err.correction}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{err.rule}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
