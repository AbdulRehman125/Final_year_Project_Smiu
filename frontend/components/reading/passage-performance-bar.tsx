"use client";

import type { PassageScore } from "@/lib/reading-types";

interface PassagePerformanceBarProps {
  score: PassageScore;
}

export function PassagePerformanceBar({ score }: PassagePerformanceBarProps) {
  const diffBadgeColor =
    score.difficulty === "easy"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : score.difficulty === "moderate"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground">
          Passage {score.passageIndex + 1}
        </span>
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${diffBadgeColor}`}
        >
          {score.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Progress bar */}
        <div className="w-32 sm:w-48 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-700"
            style={{ width: `${score.percentage}%` }}
          />
        </div>

        <span className="text-sm font-extrabold text-foreground min-w-[50px] text-right">
          {score.correct} / {score.total}
          <span className="text-xs text-muted-foreground font-normal ml-1">
            ({score.percentage.toFixed(0)}%)
          </span>
        </span>
      </div>
    </div>
  );
}
