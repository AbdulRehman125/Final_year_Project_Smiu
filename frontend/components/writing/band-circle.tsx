"use client"

// components/writing/band-circle.tsx

import { cn } from "@/lib/utils"
import { bandToColor } from "@/lib/writing-types"

interface BandCircleProps {
  band: number
  size?: "sm" | "md" | "lg"
}

export function BandCircle({ band, size = "md" }: BandCircleProps) {
  const sizes = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  }

  return (
    <div className={cn(
      "rounded-full border-4 flex items-center justify-center font-bold mx-auto",
      sizes[size],
      bandToColor(band),
      band >= 7 ? "border-emerald-500/30 bg-emerald-500/5"
      : band >= 6 ? "border-blue-500/30 bg-blue-500/5"
      : band >= 5 ? "border-amber-500/30 bg-amber-500/5"
      : "border-red-500/30 bg-red-500/5"
    )}>
      {band}
    </div>
  )
}
