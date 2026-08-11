"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check, X, Info } from "lucide-react";
import type { QuestionResult } from "@/lib/reading-types";
import { QuestionTypeBadge } from "./question-type-badge";

interface AnswerReviewCardProps {
  result: QuestionResult;
}

export function AnswerReviewCard({ result }: AnswerReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              result.isCorrect
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {result.index}
          </div>

          <p className="text-sm font-medium text-foreground truncate">
            {result.text}
          </p>

          <QuestionTypeBadge type={result.type} />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {result.isCorrect ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="w-4 h-4" /> Correct
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
              <X className="w-4 h-4" /> Incorrect
            </span>
          )}

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-border bg-muted/10 space-y-3.5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background border border-border rounded-xl p-3">
              <span className="text-xs text-muted-foreground font-medium block mb-1">
                Your Answer
              </span>
              <span className={result.isCorrect ? "font-bold text-emerald-600 dark:text-emerald-400" : "font-bold text-red-600 dark:text-red-400"}>
                {result.userAnswer || "(No Answer)"}
              </span>
            </div>

            <div className="bg-background border border-border rounded-xl p-3">
              <span className="text-xs text-muted-foreground font-medium block mb-1">
                Correct Answer
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {result.correctAnswer}
              </span>
            </div>
          </div>

          {result.paragraphRef && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Reference Paragraph: <strong className="text-foreground">Paragraph {result.paragraphRef}</strong></span>
            </div>
          )}

          {result.explanation && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-xs leading-relaxed text-foreground/90">
              <span className="font-bold text-primary block mb-1">Explanation:</span>
              {result.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
