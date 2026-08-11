"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReadingPassage } from "@/lib/reading-types";

interface SubmitDialogProps {
  open: boolean;
  passages: ReadingPassage[];
  answers: Record<number, string>;
  onClose: () => void;
  onConfirm: () => void;
}

export function SubmitDialog({
  open,
  passages,
  answers,
  onClose,
  onConfirm,
}: SubmitDialogProps) {
  if (!open) return null;

  const totalQuestions = 40;
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[Number(k)] && answers[Number(k)].trim().length > 0
  ).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Submit Test</h2>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          You have answered <span className="font-bold text-foreground">{answeredCount}</span> of {totalQuestions} questions.{" "}
          <span className="font-bold text-amber-600 dark:text-amber-400">{unansweredCount} remain unanswered.</span>
        </p>

        {/* Per passage breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {passages.map((p, idx) => {
            const [startQ, endQ] = p.questionRange || [1, 13];
            const tot = endQ - startQ + 1;
            const ans = Array.from({ length: tot }, (_, i) => startQ + i).filter(
              (q) => answers[q] && answers[q].trim().length > 0
            ).length;

            return (
              <div
                key={idx}
                className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-center space-y-1"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  P{idx + 1}
                </div>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                  {ans}/{tot}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" className="h-11 rounded-xl px-5" onClick={onClose}>
            Continue Test
          </Button>
          <Button className="h-11 rounded-xl px-6 bg-primary" onClick={onConfirm}>
            Submit Test
          </Button>
        </div>
      </div>
    </div>
  );
}
