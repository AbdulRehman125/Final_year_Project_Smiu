"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import type { ListeningSection } from "@/lib/listening-types";

interface SubmitDialogProps {
  open: boolean;
  sections: ListeningSection[];
  answers: Record<number, string>;
  onClose: () => void;
  onConfirm: () => void;
}

export function SubmitDialog({
  open,
  sections,
  answers,
  onClose,
  onConfirm,
}: SubmitDialogProps) {
  if (!open) return null;

  const stats = sections.map((section, idx) => {
    const [startQ, endQ] = section.questionRange || [1, 10];
    const total = endQ - startQ + 1;
    const answered = Array.from(
      { length: total },
      (_, i) => startQ + i
    ).filter((q) => answers[q] && answers[q].trim().length > 0).length;

    return {
      title: section.title || `Section ${idx + 1}`,
      total,
      answered,
      missing: total - answered,
    };
  });

  const totalMissing = stats.reduce((acc, curr) => acc + curr.missing, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-foreground">Submit Listening Test</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Are you sure you want to submit your test?
          </p>
        </div>

        <div className="space-y-4">
          {totalMissing > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold">You have {totalMissing} unanswered question{totalMissing > 1 ? "s" : ""}.</p>
                <p className="opacity-90">In IELTS, there is no negative marking. It is better to guess than leave a question blank.</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/30 text-xs">
                <span className="font-semibold text-foreground truncate max-w-[200px]">{stat.title}</span>
                <span className={`font-bold shrink-0 ${stat.missing > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                  {stat.answered} / {stat.total} Answered
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" className="h-11 rounded-xl px-5" onClick={onClose}>
            Continue Test
          </Button>
          <Button className="h-11 rounded-xl px-6 bg-primary" onClick={onConfirm}>
            Submit Now
          </Button>
        </div>
      </div>
    </div>
  );
}

