"use client"

// components/writing/word-counter.tsx

import { cn } from "@/lib/utils"

interface WordCounterProps {
  count: number
  minimum: number
  task: 1 | 2
}

export function WordCounter({ count, minimum, task }: WordCounterProps) {
  const isGreen  = count >= minimum
  const isOrange = count >= minimum * 0.67 && count < minimum
  const isRed    = count < minimum * 0.67

  const pct = Math.min((count / minimum) * 100, 100)

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">
          Task {task} — Word Count
        </span>
        <span className={cn(
          "text-sm font-semibold tabular-nums",
          isGreen  && "text-emerald-500",
          isOrange && "text-amber-500",
          isRed    && "text-red-500",
        )}>
          {count} / {minimum}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isGreen  && "bg-emerald-500",
            isOrange && "bg-amber-500",
            isRed    && "bg-red-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Warning */}
      {count > 0 && count < minimum && (
        <p className="text-xs text-muted-foreground mt-2">
          {minimum - count} more words needed to meet the minimum requirement.
          {count < minimum && " Writing below the minimum may lower your Task Achievement score."}
        </p>
      )}
      {count >= minimum && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
          ✓ Minimum word count met.
        </p>
      )}
    </div>
  )
}
