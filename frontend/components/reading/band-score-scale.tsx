"use client";

interface BandScoreScaleProps {
  bandScore: number;
}

export function BandScoreScale({ bandScore }: BandScoreScaleProps) {
  const min = 1;
  const max = 9;
  const percentage = Math.min(Math.max(((bandScore - min) / (max - min)) * 100, 0), 100);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Band Score Scale
      </h3>

      <div className="relative pt-6 pb-2">
        {/* Scale bar background */}
        <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 via-blue-500 to-emerald-500 opacity-80" />

        {/* Position marker */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700"
          style={{ left: `${percentage}%` }}
        >
          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-primary text-primary-foreground shadow-md whitespace-nowrap">
            {bandScore.toFixed(1)}
          </span>
          <div className="w-2 h-2 rotate-45 bg-primary -mt-1" />
        </div>

        {/* Tick labels */}
        <div className="flex justify-between text-xs text-muted-foreground font-semibold mt-3">
          <span>1.0</span>
          <span>4.5</span>
          <span>6.0</span>
          <span>7.5</span>
          <span>9.0</span>
        </div>
      </div>
    </div>
  );
}
