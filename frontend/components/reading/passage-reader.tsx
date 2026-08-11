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
    <div className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
            Passage {passage.index + 1}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {passage.paragraphs.length} paragraphs
          </span>
        </div>

        <button
          type="button"
          onClick={() => setHighlightMode(!highlightMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            highlightMode
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <Highlighter className="w-3.5 h-3.5" />
          {highlightMode ? "Highlighting ON" : "Highlight"}
        </button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight uppercase">
          {passage.title}
        </h1>

        <div className="space-y-5 text-sm sm:text-base leading-relaxed text-foreground/90">
          {passage.paragraphs.map((p) => (
            <div key={p.label} id={`p-${p.label}`} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs border border-border mt-0.5">
                {p.label}
              </span>
              <div className="flex-1">
                <HighlightingText key={`${passage.index}-${p.label}`} text={p.text} enabled={highlightMode} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
