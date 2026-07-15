// "use client"

// // components/writing/writing-area.tsx

// interface WritingAreaProps {
//   value: string
//   onChange: (val: string) => void
//   placeholder?: string
// }

// export function WritingArea({ value, onChange, placeholder }: WritingAreaProps) {
//   return (
//     <textarea
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder={placeholder}
//       spellCheck={true}
//       className="
//         w-full min-h-[480px] resize-none rounded-2xl border border-border
//         bg-card text-foreground text-sm leading-relaxed
//         px-5 py-4 placeholder:text-muted-foreground/50
//         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
//         transition-all duration-200 font-[inherit]
//       "
//     />
//   )
// }

















"use client"

// components/writing/writing-area.tsx
//
// Note on the toolbar: real IELTS Writing responses are plain text — the
// actual exam gives candidates no bold/italic/formatting, and the backend
// scores the raw text (word count, contraction detection, etc. via regex).
// Inserting markdown characters (**bold**) into the response would corrupt
// that scoring. So instead of decorative/unsafe formatting buttons, this
// toolbar has two genuinely useful, non-destructive actions:
//   - Focus mode: hides the prompt panel so writing gets full width
//   - Fullscreen: opens a distraction-free full-screen editor overlay

import { useState } from "react"
import { Focus, Maximize2, Minimize2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface WritingAreaProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  minimum?: number
  isFocusMode?: boolean
  onToggleFocusMode?: () => void
}

function computeStats(text: string) {
  const trimmed = text.trim()
  const words = trimmed ? trimmed.split(/\s+/).length : 0
  const characters = text.length
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0
  return { words, characters, paragraphs }
}

function Toolbar({
  isFocusMode,
  onToggleFocusMode,
  isFullscreen,
  onToggleFullscreen,
}: {
  isFocusMode?: boolean
  onToggleFocusMode?: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
      <div className="flex items-center gap-1">
        {onToggleFocusMode && (
          <button
            type="button"
            onClick={onToggleFocusMode}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors",
              isFocusMode
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Focus className="w-3.5 h-3.5" />
            Focus
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleFullscreen}
        className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  )
}

function StatsFooter({ text, minimum }: { text: string; minimum?: number }) {
  const { words, characters, paragraphs } = computeStats(text)
  const pct = minimum ? Math.min(Math.round((words / minimum) * 100), 100) : 0
  const underMinimum = minimum != null && words < minimum

  return (
    <div className="px-4 py-2.5 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
      <span className="tabular-nums">
        {words}{minimum ? ` / ${minimum}` : ""} words
      </span>
      <span className="tabular-nums">{characters} characters</span>
      <span className="tabular-nums">{paragraphs} paragraphs</span>

      {minimum != null && (
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                underMinimum ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="tabular-nums w-8 text-right">{pct}%</span>
        </div>
      )}
    </div>
  )
}

export function WritingArea({
  value,
  onChange,
  placeholder,
  minimum,
  isFocusMode,
  onToggleFocusMode,
}: WritingAreaProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const textarea = (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={true}
      autoFocus={isFullscreen}
      className="
        w-full flex-1 min-h-[300px] resize-none
        bg-transparent text-foreground text-sm leading-relaxed
        px-5 py-4 placeholder:text-muted-foreground/50
        focus:outline-none font-[inherit]
      "
    />
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground">Fullscreen — Distraction-free writing</span>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Exit fullscreen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 max-w-3xl mx-auto w-full flex flex-col">
          {textarea}
        </div>
        <StatsFooter text={value} minimum={minimum} />
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
      <Toolbar
        isFocusMode={isFocusMode}
        onToggleFocusMode={onToggleFocusMode}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(true)}
      />
      {textarea}
      <StatsFooter text={value} minimum={minimum} />
    </div>
  )
}