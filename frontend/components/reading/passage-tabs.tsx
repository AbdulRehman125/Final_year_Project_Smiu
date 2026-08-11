"use client";

import type { ReadingPassage } from "@/lib/reading-types";

interface PassageTabsProps {
  passages: ReadingPassage[];
  activePassage: number;
  answers: Record<number, string>;
  onSelectPassage: (idx: number) => void;
}

export function PassageTabs({
  passages,
  activePassage,
  answers,
  onSelectPassage,
}: PassageTabsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-3 bg-muted/40 p-1 rounded-2xl border border-border">
      {passages.map((p, idx) => {
        const isActive = activePassage === idx;
        const [startQ, endQ] = p.questionRange || [1, 13];
        const total = endQ - startQ + 1;
        const answered = Array.from(
          { length: total },
          (_, i) => startQ + i
        ).filter((q) => answers[q] && answers[q].trim().length > 0).length;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPassage(idx)}
            className={`flex-1 flex items-center justify-between gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:bg-muted/60"
            }`}
          >
            <span className="truncate whitespace-nowrap">Passage {idx + 1}</span>
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shrink-0 ${
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {answered}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
