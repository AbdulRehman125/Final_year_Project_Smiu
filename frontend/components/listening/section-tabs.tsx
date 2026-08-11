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
    <div className="flex items-center gap-1.5 sm:gap-3 bg-muted/40 p-1 rounded-2xl border border-border">
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
            className={`flex-1 flex items-center justify-between gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:bg-muted/60"
            }`}
          >
            <span className="truncate whitespace-nowrap">Section {idx + 1}</span>
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
