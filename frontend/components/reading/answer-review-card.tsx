"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check, X, Info } from "lucide-react";
import type { QuestionResult } from "@/lib/reading-types";

interface AnswerReviewCardProps {
  result: QuestionResult;
}

export function AnswerReviewCard({ result }: AnswerReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "mcq":
        return "MULTIPLE CHOICE";
      case "true_false_not_given":
        return "TRUE / FALSE / NOT GIVEN";
      case "matching_headings":
        return "MATCHING HEADINGS";
      case "sentence_completion":
        return "SENTENCE COMPLETION";
      case "short_answer":
        return "SHORT ANSWER";
      default:
        return "QUESTION";
    }
  };

  return (
    <div className="border border-slate-100 dark:border-border/40 rounded-2xl overflow-hidden transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
      {/* Header Row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
              result.isCorrect
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-rose-50 text-rose-600 border border-rose-200"
            }`}
          >
            {result.index}
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
            {result.text}
          </p>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 shrink-0">
            {getQuestionTypeLabel(result.type)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-border/40 bg-slate-50/40 dark:bg-slate-900/30 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Your Answer
              </span>
              <span className={result.isCorrect ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                {result.userAnswer || "(No Answer)"}
              </span>
            </div>

            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Correct Answer
              </span>
              <span className="font-bold text-emerald-600">
                {result.correctAnswer}
              </span>
            </div>
          </div>

          {result.paragraphRef && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Reference Paragraph: <strong className="text-slate-800 dark:text-slate-200">Paragraph {result.paragraphRef}</strong></span>
            </div>
          )}

          {result.explanation && (
            <div className="bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800/60 rounded-xl p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="font-bold text-sky-600 dark:text-sky-400 block mb-0.5">Explanation:</span>
              {result.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
