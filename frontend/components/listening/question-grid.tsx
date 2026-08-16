"use client";

interface QuestionGridProps {
  startQ: number;
  endQ: number;
  activeQ: number;
  answers: Record<number, string>;
  flags: Set<number>;
  onSelectQ: (qIdx: number) => void;
}

export function QuestionGrid({
  startQ,
  endQ,
  activeQ,
  answers,
  flags,
  onSelectQ,
}: QuestionGridProps) {
  const questions = Array.from(
    { length: endQ - startQ + 1 },
    (_, i) => startQ + i
  );

  const answeredCount = questions.filter(
    (q) => answers[q] && answers[q].trim().length > 0
  ).length;
  const flaggedCount = questions.filter((q) => flags.has(q)).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-5 shadow-sm space-y-3.5">
      {/* Header with stats and dots */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
          QUESTIONS {startQ}–{endQ}
        </h3>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
            {answeredCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {flaggedCount}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
            {unansweredCount}
          </span>
        </div>
      </div>

      {/* Grid of Number Badges */}
      <div className="flex flex-wrap gap-2">
        {questions.map((qNum) => {
          const isActive = activeQ === qNum;
          const isAnswered = answers[qNum] && answers[qNum].trim().length > 0;
          const isFlagged = flags.has(qNum);

          let bgClass = "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/90 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800";
          if (isActive) {
            bgClass = "bg-[#0284c7] text-white border-[#0284c7] font-bold shadow-sm";
          } else if (isFlagged) {
            bgClass = "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 font-bold";
          } else if (isAnswered) {
            bgClass = "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 font-bold";
          }

          return (
            <button
              key={qNum}
              type="button"
              onClick={() => onSelectQ(qNum)}
              className={`relative w-8 h-8 rounded-full border text-xs flex items-center justify-center transition-all ${bgClass}`}
            >
              {qNum}

              {/* Flag indicator dot */}
              {isFlagged && !isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-background" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
