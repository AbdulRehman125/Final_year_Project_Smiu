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
  const total = questions.length;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Questions {startQ}–{endQ}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {answeredCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {flaggedCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            {total - answeredCount}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
        {questions.map((qNum) => {
          const isActive = activeQ === qNum;
          const isAnswered = answers[qNum] && answers[qNum].trim().length > 0;
          const isFlagged = flags.has(qNum);

          let bgClass = "bg-muted/50 text-muted-foreground border-border hover:bg-muted";
          if (isActive) {
            bgClass = "bg-primary text-primary-foreground border-primary shadow-sm font-bold scale-105";
          } else if (isAnswered) {
            bgClass = "bg-primary/15 text-primary border-primary/30 font-semibold";
          }

          return (
            <button
              key={qNum}
              type="button"
              onClick={() => onSelectQ(qNum)}
              className={`relative w-10 h-10 rounded-full border text-sm flex items-center justify-center transition-all ${bgClass}`}
            >
              {qNum}

              {/* Flag indicator dot */}
              {isFlagged && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-background" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
