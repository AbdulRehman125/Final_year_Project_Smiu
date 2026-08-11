"use client";

interface BandScoreScaleProps {
  bandScore: number;
}

export function BandScoreScale({ bandScore }: BandScoreScaleProps) {
  const bands = Array.from({ length: 17 }, (_, i) => 1 + i * 0.5); // 1.0 to 9.0

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Overall Performance
          </h3>
          <div className="text-3xl font-extrabold text-foreground">
            Band {bandScore.toFixed(1)}
          </div>
        </div>
        
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {bandScore >= 7.0 ? "Excellent" : bandScore >= 6.0 ? "Good" : "Needs Improvement"}
          </div>
        </div>
      </div>

      <div className="relative pt-6 pb-2">
        {/* Track */}
        <div className="absolute top-8 left-0 right-0 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary/30 transition-all duration-1000 ease-out"
            style={{ width: `${((bandScore - 1) / 8) * 100}%` }}
          />
        </div>

        {/* Markers */}
        <div className="relative flex justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((band) => {
            const isActive = band <= bandScore;
            const isCurrent = Math.floor(bandScore) === band || Math.ceil(bandScore) === band && bandScore % 1 !== 0 ? false : bandScore === band;
            
            return (
              <div key={band} className="flex flex-col items-center">
                <div 
                  className={`w-4 h-4 rounded-full z-10 transition-all duration-500 border-2 ${
                    isActive 
                      ? "bg-primary border-primary" 
                      : "bg-card border-muted-foreground/30"
                  } ${isCurrent ? "ring-4 ring-primary/20 scale-125" : ""}`}
                />
                <span className={`text-xs font-bold mt-2 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {band}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Current floating marker if it's a .5 score */}
        {bandScore % 1 !== 0 && (
          <div 
            className="absolute top-4 -mt-2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-1000 z-20"
            style={{ left: `${((bandScore - 1) / 8) * 100}%` }}
          >
            <div className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded shadow-sm mb-1">
              {bandScore.toFixed(1)}
            </div>
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent border-t-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
