"use client";

import { TrendingUp } from "lucide-react";

interface BandScoreScaleProps {
  bandScore: number;
}

export function BandScoreScale({ bandScore }: BandScoreScaleProps) {
  const min = 1;
  const max = 9;
  const percentage = Math.min(Math.max(((bandScore - min) / (max - min)) * 100, 0), 100);

  return (
    <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-sky-500" />
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
          BAND SCORE SCALE
        </h3>
      </div>

      <div className="relative pt-6 pb-2">
        {/* Position marker bubble */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
          style={{ left: `${percentage}%` }}
        >
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#0284c7] text-white shadow-sm whitespace-nowrap">
            {bandScore.toFixed(1)}
          </span>
          <div className="w-1.5 h-1.5 rotate-45 bg-[#0284c7] -mt-1" />
        </div>

        {/* Scale bar background */}
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-rose-400 via-amber-400 via-sky-400 to-emerald-400" />

        {/* Tick labels */}
        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-bold mt-3">
          <span>6</span>
          <span>6.5</span>
          <span>7</span>
          <span>7.5</span>
          <span>8</span>
          <span>8.5</span>
          <span>9</span>
        </div>
      </div>
    </div>
  );
}
