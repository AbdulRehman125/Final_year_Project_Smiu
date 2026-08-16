"use client";

import type { ListeningSection } from "@/lib/listening-types";

interface SectionTabsProps {
  sections: ListeningSection[];
  activeSection: number;
  answers: Record<number, string>;
  onSelectSection: (idx: number) => void;
}

export function SectionTabs({
  sections,
  activeSection,
  answers,
  onSelectSection,
}: SectionTabsProps) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 p-1.5 rounded-2xl shadow-sm">
      {sections.map((section, idx) => {
        const isActive = activeSection === idx;
        const [startQ, endQ] = section.questionRange || [1, 10];
        const total = endQ - startQ + 1;
        const answered = Array.from(
          { length: total },
          (_, i) => startQ + i
        ).filter((q) => answers[q] && answers[q].trim().length > 0).length;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSection(idx)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#0284c7] text-white shadow-sm font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="truncate whitespace-nowrap">Section {idx + 1}</span>
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
