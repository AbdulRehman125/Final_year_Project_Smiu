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
    <div className="flex items-center gap-2 bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 p-1.5 rounded-2xl shadow-sm">
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
            className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#0284c7] text-white shadow-sm font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="truncate whitespace-nowrap">Passage {idx + 1}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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
