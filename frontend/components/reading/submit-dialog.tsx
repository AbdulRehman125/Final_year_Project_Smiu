"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReadingPassage } from "@/lib/reading-types";

interface SubmitDialogProps {
  open: boolean;
  passages?: ReadingPassage[];
  answers?: Record<number, string>;
  totalAnswered?: number;
  totalQuestions?: number;
  flaggedCount?: number;
  timeLeft?: number;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onClose?: () => void;
  onConfirm: () => void;
}

export function SubmitDialog({
  open,
  passages = [],
  answers = {},
  totalAnswered,
  totalQuestions = 40,
  flaggedCount = 0,
  timeLeft,
  isSubmitting = false,
  onCancel,
  onClose,
  onConfirm,
}: SubmitDialogProps) {
  if (!open) return null;

  const handleDismiss = onCancel || onClose || (() => {});

  const answeredCount =
    typeof totalAnswered === "number"
      ? totalAnswered
      : Object.keys(answers).filter(
          (k) => answers[Number(k)] && answers[Number(k)].trim().length > 0
        ).length;

  const unansweredCount = Math.max(totalQuestions - answeredCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close icon */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
              Submit Reading Test
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you ready to submit your test?
            </p>
          </div>
        </div>

        {/* Status Breakdown Box */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Answered Questions:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold">
                <span>Unanswered Questions:</span>
                <span>{unansweredCount} remaining</span>
              </div>
            )}
            {flaggedCount > 0 && (
              <div className="flex items-center justify-between text-slate-500">
                <span>Flagged for Review:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {flaggedCount}
                </span>
              </div>
            )}
          </div>

          {/* Per passage breakdown if passages provided */}
          {passages.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {passages.map((p, idx) => {
                const [startQ, endQ] = p.questionRange || [1, 13];
                const tot = endQ - startQ + 1;
                const ans = Array.from({ length: tot }, (_, i) => startQ + i).filter(
                  (q) => answers[q] && answers[q].trim().length > 0
                ).length;

                return (
                  <div
                    key={idx}
                    className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/50 rounded-xl p-2.5 text-center"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      P{idx + 1}
                    </div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 mt-0.5">
                      {ans}/{tot}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            className="h-10 rounded-full px-5 text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
            onClick={handleDismiss}
            disabled={isSubmitting}
          >
            Continue Test
          </Button>
          <Button
            className="h-10 rounded-full px-6 text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[0_3px_12px_rgba(2,132,199,0.3)] transition-all"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </Button>
        </div>
      </div>
    </div>
  );
}
