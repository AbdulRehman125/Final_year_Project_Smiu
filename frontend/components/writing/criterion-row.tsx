"use client"

// components/writing/criterion-row.tsx

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { bandToColor } from "@/lib/writing-types"

interface CriterionRowProps {
  label: string
  band: number
  feedback: string
}

export function CriterionRow({ label, band, feedback }: CriterionRowProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {/* Band badge */}
        <span className={cn(
          "text-sm font-bold w-8 text-center flex-shrink-0",
          bandToColor(band)
        )}>
          {band}
        </span>

        {/* Bar */}
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              band >= 7 ? "bg-emerald-500"
              : band >= 6 ? "bg-blue-500"
              : band >= 5 ? "bg-amber-500"
              : "bg-red-500"
            )}
            style={{ width: `${(band / 9) * 100}%` }}
          />
        </div>

        <span className="text-sm text-foreground font-medium flex-shrink-0">{label}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-3 pt-1 border-t border-border bg-muted/10">
          <p className="text-sm text-muted-foreground leading-relaxed">{feedback}</p>
        </div>
      )}
    </div>
  )
}
