"use client";

import { Clock } from "lucide-react";

interface ListeningTimerProps {
  secondsLeft: number;
}

export function ListeningTimer({ secondsLeft }: ListeningTimerProps) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const isCritical = secondsLeft <= 60;
  const isWarning = secondsLeft <= 300 && !isCritical;

  return (
    <div
      className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border bg-white dark:bg-card shadow-sm transition-colors ${
        isCritical
          ? "border-red-400 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 animate-pulse"
          : isWarning
          ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
          : "border-slate-200/80 dark:border-border/60 text-slate-800 dark:text-slate-200"
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
        <Clock className="w-4 h-4" />
      </div>
      <div>
        <div className="text-base sm:text-lg font-black tracking-tight leading-none">
          {formatted}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
          REMAINING
        </div>
      </div>
    </div>
  );
}
