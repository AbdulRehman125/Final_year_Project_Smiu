"use client";

import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { QuestionTypeBadge } from "./question-type-badge";

interface AnswerReviewCardProps {
  result: {
    index: number;
    sectionIndex: number;
    type: string;
    text: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  };
}

export function AnswerReviewCard({ result }: AnswerReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-2xl p-4 sm:p-5 transition-all ${
        result.isCorrect
          ? "border-green-500/30 bg-green-500/5 dark:bg-green-500/10"
          : "border-red-500/30 bg-red-500/5 dark:bg-red-500/10"
      }`}
    >
      <div
        className="flex items-center justify-between gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
              result.isCorrect ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {result.index}
          </div>
          <p className="text-sm font-semibold text-foreground truncate flex-1">
            {result.text}
          </p>
          <div className="shrink-0">
            <QuestionTypeBadge type={result.type} />
          </div>
        </div>

        <button type="button" className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-background/50 border border-border/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Your Answer
          </div>
          <div className="flex items-center gap-2 font-medium">
            {result.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className={result.isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {result.userAnswer || <span className="italic opacity-50">Not answered</span>}
            </span>
          </div>
        </div>
        
        <div className="p-3 rounded-xl bg-background/50 border border-border/50">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Correct Answer
          </div>
          <div className="font-medium text-foreground">
            {result.correctAnswer}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border/50 space-y-3 animate-in fade-in slide-in-from-top-2">
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Question
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {result.text}
            </p>
          </div>
          
          {result.explanation && (
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Explanation
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                {result.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
