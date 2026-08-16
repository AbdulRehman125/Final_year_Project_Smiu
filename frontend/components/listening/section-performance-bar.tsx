"use client";

interface SectionPerformanceBarProps {
  score: {
    sectionIndex: number;
    correct: number;
    total: number;
    difficulty: string;
  };
}

export function SectionPerformanceBar({ score }: SectionPerformanceBarProps) {
  const percentage = Math.round((score.correct / score.total) * 100);

  const diffBadgeColor =
    score.difficulty.toLowerCase() === "easy"
      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
      : score.difficulty.toLowerCase() === "moderate" || score.difficulty.toLowerCase() === "medium"
      ? "bg-amber-50 text-amber-600 border-amber-200"
      : "bg-rose-50 text-rose-600 border-rose-200";

  return (
    <div className="space-y-1.5 py-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-100">
            Section {score.sectionIndex}
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border ${diffBadgeColor}`}
          >
            {score.difficulty === "moderate"
              ? "MEDIUM"
              : score.difficulty.toUpperCase()}
          </span>
        </div>

        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {score.correct} / {score.total}{" "}
          <span className="text-slate-400 font-normal text-[11px]">
            ({percentage}%)
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            percentage >= 60
              ? "bg-[#0284c7]"
              : percentage >= 35
              ? "bg-rose-400"
              : "bg-rose-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
