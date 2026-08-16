"use client";

import { useState } from "react";
import { Highlighter } from "lucide-react";
import { HighlightingText } from "./highlighting-text";
import type { ReadingPassage } from "@/lib/reading-types";

interface PassageReaderProps {
  passage: ReadingPassage;
}

export function PassageReader({ passage }: PassageReaderProps) {
  const [highlightMode, setHighlightMode] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] overflow-hidden shadow-sm">
      {/* Top Header */}
      <div className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800">
            PASSAGE {passage.index + 1}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {passage.paragraphs.length} paragraphs
          </span>
        </div>

        <button
          type="button"
          onClick={() => setHighlightMode(!highlightMode)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            highlightMode
              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
              : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Highlighter className="w-3.5 h-3.5 text-slate-500" />
          <span>{highlightMode ? "Highlighting ON" : "Highlight"}</span>
        </button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 pb-8 space-y-6">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug uppercase">
          {passage.title}
        </h1>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {passage.paragraphs.map((p) => (
            <div key={p.label} id={`p-${p.label}`} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs mt-0.5 select-none">
                {p.label}
              </span>
              <div className="flex-1 leading-relaxed">
                <HighlightingText key={`${passage.index}-${p.label}`} text={p.text} enabled={highlightMode} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
