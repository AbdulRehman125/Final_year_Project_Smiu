"use client"

// components/writing/writing-area.tsx

interface WritingAreaProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function WritingArea({ value, onChange, placeholder }: WritingAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={true}
      className="
        w-full min-h-[480px] resize-none rounded-2xl border border-border
        bg-card text-foreground text-sm leading-relaxed
        px-5 py-4 placeholder:text-muted-foreground/50
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
        transition-all duration-200 font-[inherit]
      "
    />
  )
}
