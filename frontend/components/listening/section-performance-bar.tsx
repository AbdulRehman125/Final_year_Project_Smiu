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
  
  let colorClass = "bg-red-500";
  if (percentage >= 80) colorClass = "bg-green-500";
  else if (percentage >= 60) colorClass = "bg-amber-500";

  let diffColor = "bg-green-500/10 text-green-600 border-green-500/20";
  if (score.difficulty.toLowerCase() === "hard") diffColor = "bg-red-500/10 text-red-600 border-red-500/20";
  else if (score.difficulty.toLowerCase() === "medium") diffColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-foreground">
            Section {score.sectionIndex}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${diffColor}`}>
            {score.difficulty}
          </span>
        </div>
        <div className="text-sm font-medium">
          <span className="text-foreground text-lg font-bold">{score.correct}</span>
          <span className="text-muted-foreground"> / {score.total} correct</span>
          <span className="text-muted-foreground ml-2 text-xs">({percentage}%)</span>
        </div>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
