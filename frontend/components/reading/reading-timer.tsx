"use client";

import { Clock } from "lucide-react";

interface ReadingTimerProps {
  secondsLeft: number;
}

export function ReadingTimer({ secondsLeft }: ReadingTimerProps) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, "0")} : ${String(secs).padStart(2, "0")}`;

  const isCritical = secondsLeft <= 60;
  const isWarning = secondsLeft <= 300 && !isCritical;

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 rounded-2xl border bg-card shadow-sm transition-colors ${
        isCritical
          ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
          : isWarning
          ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border text-foreground"
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0">
        <Clock className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-extrabold tracking-wider leading-none">
          {formatted}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
          Remaining
        </div>
      </div>
    </div>
  );
}
