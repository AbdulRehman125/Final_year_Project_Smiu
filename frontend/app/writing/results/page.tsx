




"use client"

// app/writing/results/page.tsx
//
// Results screen — rebuilt to match the approved Figma "IELTS Writing Results"
// design. This file implements the **Overview** tab in full. The "Task 1" and
// "Task 2" tabs are wired into the tab bar but render an interim detailed
// breakdown (reusing the existing CriterionRow / ErrorList) until their own
// designs land.
//
// ── Data contract note ─────────────────────────────────────────────────────
// The design surfaces a few metrics that the current `WritingEvaluationResponse`
// does not carry. They are consumed here as OPTIONAL fields so nothing breaks
// if the backend hasn't sent them yet, with safe client-side fallbacks:
//
//   task1_score.sentence_count?     paragraph_count?     unique_word_count?
//   task1_score.time_taken_seconds? (per-task timing for TIME DISTRIBUTION)
//   results.task1_response? / task2_response?  (echoed answer text, if any)
//   results.recommendations?        (falls back to `improvements`)
//
// If those optional fields are absent we derive sentences/paragraphs/unique
// words from the answer text (echoed response, else the autosaved draft), and
// estimate per-task time from word-count share of the total. Add the fields to
// the evaluate endpoint to make every number authoritative.
// ───────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Moon,
  Sun,
  Trophy,
  PencilLine,
  Clock,
  Type as TypeIcon,
  Target,
  TrendingUp,
  Lightbulb,
  Eye,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Hash,
  Sparkles,
  Info,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { bandToLabel, bandToColor, type WritingEvaluationResponse } from "@/lib/writing-types"
import { safeSessionStorage } from "@/lib/writing-network-utils"
import { AiDetectionCard } from "@/components/writing/ai-detection-card"
import { ErrorList } from "@/components/writing/error-list"

/* ──────────────────────────────────────────────────────────────────────────
 * Types (local, optional-field augmentation over the shared contract)
 * ────────────────────────────────────────────────────────────────────────── */

type TaskScore = WritingEvaluationResponse["task1_score"] & {
  sentence_count?: number
  paragraph_count?: number
  unique_word_count?: number
  time_taken_seconds?: number
  // Optional writing-metric fields — used if the backend supplies them,
  // otherwise derived client-side from the answer text (see computeMetrics).
  avg_sentence_length?: number
  avg_word_length?: number
  connective_count?: number
  vocabulary_richness?: number // fraction (0–1) or percent (>1); both handled
}

type ResultsData = WritingEvaluationResponse & {
  task1_response?: string
  task2_response?: string
  recommendations?: string[]
}

type Tab = "overview" | 1 | 2

interface TextStats {
  words: number
  sentences: number
  paragraphs: number
  unique: number
}

/* ──────────────────────────────────────────────────────────────────────────
 * Pure helpers
 * ────────────────────────────────────────────────────────────────────────── */

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds || 0))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Derive readable stats from an answer string. Only used as a fallback when
 *  the backend hasn't supplied counts of its own. */
function computeTextStats(text?: string): TextStats {
  if (!text || !text.trim()) return { words: 0, sentences: 0, paragraphs: 0, unique: 0 }
  const trimmed = text.trim()
  const wordTokens = trimmed.split(/\s+/).filter(Boolean)
  const sentences = (trimmed.match(/[^.!?]+[.!?]+/g) || []).length || 1
  const paragraphs = trimmed.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length || 1
  const unique = new Set(
    wordTokens.map((w) => w.toLowerCase().replace(/[^a-z0-9']/g, "")).filter(Boolean)
  ).size
  return { words: wordTokens.length, sentences, paragraphs, unique }
}

/** Prefer a backend-supplied number only when it's actually present and > 0;
 *  otherwise fall back to the client-computed value. This stops a missing or
 *  zeroed backend field from wiping out a stat we can derive from the text. */
function pick(backend: number | undefined, computed: number): number {
  return typeof backend === "number" && backend > 0 ? backend : computed
}

/** Resolve the stats shown in "Word count overview" for one task, preferring
 *  authoritative backend counts, then computed-from-text, then word_count. */
function resolveStats(score: TaskScore, answerText?: string): TextStats {
  const computed = computeTextStats(answerText)
  return {
    words: pick(score.word_count, computed.words),
    sentences: pick(score.sentence_count, computed.sentences),
    paragraphs: pick(score.paragraph_count, computed.paragraphs),
    unique: pick(score.unique_word_count, computed.unique),
  }
}

/** Common IELTS cohesive devices, used to count connectives when the backend
 *  hasn't provided a count. Order longest-first so multi-word phrases match. */
const CONNECTIVES = [
  "on the other hand", "on the contrary", "in other words", "as a result",
  "in conclusion", "to summarize", "to sum up", "in summary", "for example",
  "for instance", "in addition", "in contrast", "by contrast", "in particular",
  "as well as", "in fact", "even though", "in spite of", "however", "furthermore",
  "moreover", "therefore", "thus", "consequently", "additionally", "whereas",
  "although", "though", "despite", "nevertheless", "nonetheless", "hence",
  "similarly", "likewise", "meanwhile", "subsequently", "overall", "besides",
  "accordingly", "indeed", "notably", "firstly", "secondly", "thirdly", "finally",
]

interface Metrics {
  words: number
  sentences: number
  paragraphs: number
  unique: number
  avgSentenceLength: number
  avgWordLength: number
  connectives: number
  richnessPct: number
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0
  let idx = haystack.indexOf(needle)
  while (idx !== -1) {
    count++
    idx = haystack.indexOf(needle, idx + needle.length)
  }
  return count
}

/** Resolve every metric shown on the task tab, preferring backend values and
 *  falling back to a client-side derivation from the answer text. */
function computeMetrics(score: TaskScore, answerText?: string): Metrics {
  const text = (answerText || "").trim()
  const rawWords = text ? text.split(/\s+/).filter(Boolean) : []
  const cleaned = rawWords.map((w) => w.toLowerCase().replace(/[^a-z0-9']/g, "")).filter(Boolean)

  const words = pick(score.word_count, rawWords.length)
  const sentences = pick(score.sentence_count, (text.match(/[^.!?]+[.!?]+/g) || []).length || (text ? 1 : 0))
  const paragraphs = pick(score.paragraph_count, text ? text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).length || 1 : 0)
  const unique = pick(score.unique_word_count, new Set(cleaned).size)

  const totalChars = cleaned.reduce((sum, w) => sum + w.length, 0)
  const avgWordLength = pick(score.avg_word_length, cleaned.length ? totalChars / cleaned.length : 0)
  const avgSentenceLength = pick(score.avg_sentence_length, sentences ? words / sentences : 0)

  let connectives = typeof score.connective_count === "number" ? score.connective_count : undefined
  if (connectives == null) {
    const normalized = " " + text.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim() + " "
    connectives = CONNECTIVES.reduce((n, c) => n + countOccurrences(normalized, " " + c + " "), 0)
  }

  let richnessPct: number
  if (typeof score.vocabulary_richness === "number" && score.vocabulary_richness > 0) {
    richnessPct = score.vocabulary_richness > 1 ? score.vocabulary_richness : score.vocabulary_richness * 100
  } else {
    richnessPct = rawWords.length ? (unique / rawWords.length) * 100 : 0
  }

  return {
    words,
    sentences,
    paragraphs,
    unique,
    avgSentenceLength,
    avgWordLength,
    connectives,
    richnessPct,
  }
}

/** Minimal shape check so a corrupted/partial payload never crashes the page. */
function isValidResults(v: unknown): v is ResultsData {
  if (!v || typeof v !== "object") return false
  const r = v as Record<string, unknown>
  return !!r.task1_score && !!r.task2_score && typeof r.overall_writing_band !== "undefined"
}

/* ──────────────────────────────────────────────────────────────────────────
 * Small presentational primitives
 * ────────────────────────────────────────────────────────────────────────── */

/** Eyebrow header used at the top of every card: tinted icon chip + label. */
function CardEyebrow({
  icon: Icon,
  label,
  tint = "text-primary bg-primary/10",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  tint?: string
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center", tint)}>
        <Icon className="w-4 h-4" />
      </span>
      <h2 className="text-sm font-bold tracking-wide text-foreground uppercase">{label}</h2>
    </div>
  )
}

/** The hero band ring: light track + proportional blue arc, band in the middle. */
function ScoreRing({ band, max = 9 }: { band: number; max?: number }) {
  const size = 132
  const stroke = 11
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = clamp(band / max, 0, 1)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="text-primary transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-foreground leading-none">{band}</span>
        <span className="text-[11px] text-muted-foreground mt-0.5">of {max.toFixed(1)}</span>
      </div>
    </div>
  )
}

/** A labelled score row inside "Task scores": word badge, band bar, band value. */
function TaskScoreRow({
  label,
  band,
  words,
  min,
  max = 9,
}: {
  label: string
  band: number
  words: number
  min: number
  max?: number
}) {
  const enough = words >= min
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
              enough ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            )}
          >
            {words}/{min} words
          </span>
        </div>
        <span className="text-xl font-bold text-foreground tabular-nums">{band}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", enough ? "bg-emerald-500" : "bg-rose-500")}
          style={{ width: `${clamp((band / max) * 100, 0, 100)}%` }}
        />
      </div>
    </div>
  )
}

/** A single task card inside "Word count overview". */
function WordCountCard({ label, stats, min }: { label: string; stats: TextStats; min: number }) {
  const enough = stats.words >= min
  const short = Math.max(0, min - stats.words)
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        enough ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium",
            enough ? "text-emerald-600" : "text-amber-600"
          )}
        >
          {enough ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {enough ? "Meets minimum" : `${short} words short`}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-3xl font-extrabold text-foreground leading-none tabular-nums">{stats.words}</span>
        <span className="text-sm text-muted-foreground">/ {min} words</span>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
        <div
          className={cn("h-full rounded-full transition-all duration-700", enough ? "bg-emerald-500" : "bg-rose-500")}
          style={{ width: `${clamp((stats.words / min) * 100, 0, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {stats.sentences} sentences · {stats.paragraphs} paragraphs
        </span>
        <span>{stats.unique} unique words</span>
      </div>
    </div>
  )
}

/** Dependency-free radar chart for the four IELTS criteria (0–9 scale). */
function CriteriaRadar({
  task1,
  task2,
  max = 9,
}: {
  task1: number[]
  task2: number[]
  max?: number
}) {
  const axes = ["TA", "CC", "LR", "GRA"] // top, right, bottom, left
  const cx = 150
  const cy = 140
  const R = 92
  const labelR = 116
  const angle = (i: number) => (-90 + i * 90) * (Math.PI / 180)
  const point = (i: number, value: number, radius = R) => {
    const r = (clamp(value, 0, max) / max) * radius
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))] as const
  }
  const polygon = (vals: number[]) => vals.map((v, i) => point(i, v).join(",")).join(" ")
  const rings = [max / 3, (2 * max) / 3, max]

  return (
    <svg viewBox="0 0 300 285" className="w-full max-w-[340px] mx-auto" role="img" aria-label="Criteria comparison radar chart">
      {/* grid rings */}
      {rings.map((lvl, ri) => (
        <polygon
          key={ri}
          points={axes.map((_, i) => point(i, lvl).join(",")).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-border"
        />
      ))}
      {/* axes */}
      {axes.map((_, i) => {
        const [x, y] = point(i, max)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeWidth={1} className="text-border" />
      })}
      {/* task 1 */}
      <polygon points={polygon(task1)} fill="rgb(56 189 248 / 0.15)" stroke="rgb(56 189 248)" strokeWidth={2} strokeLinejoin="round" />
      {/* task 2 */}
      <polygon points={polygon(task2)} fill="rgb(37 99 235 / 0.18)" stroke="rgb(37 99 235)" strokeWidth={2} strokeLinejoin="round" />
      {/* labels */}
      {axes.map((label, i) => {
        const [x, y] = point(i, max, labelR)
        const anchor = i === 1 ? "start" : i === 3 ? "end" : "middle"
        const dy = i === 0 ? -2 : i === 2 ? 12 : 4
        return (
          <text key={label} x={x} y={y + dy} textAnchor={anchor} className="fill-muted-foreground text-[11px] font-medium">
            {label}
          </text>
        )
      })}
    </svg>
  )
}

/** Gradient band scale (4–9) with a marker bubble at the overall band. */
function BandScale({ band }: { band: number }) {
  const min = 4
  const max = 9
  const pos = clamp(((band - min) / (max - min)) * 100, 0, 100)
  const ticks = [4, 5, 6, 7, 8, 9]
  const nearest = Math.round(band)
  return (
    <div className="pt-4">
      <div className="relative h-2.5 rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
        {/* bubble */}
        <div
          className="absolute -top-9 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${pos}%` }}
        >
          <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
            {band}
          </span>
        </div>
        {/* handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20 border-2 border-background"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 px-0.5">
        {ticks.map((t) => (
          <span
            key={t}
            className={cn("text-xs tabular-nums", t === nearest ? "font-bold text-primary" : "text-muted-foreground")}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Horizontal time-per-task bars with a minute axis. */
function TimeDistribution({ t1, t2 }: { t1: number; t2: number }) {
  // Axis scaled to the larger task, rounded up to a clean quarter-minute.
  const maxSec = Math.max(t1, t2, 15)
  const niceMaxMin = Math.max(0.75, Math.ceil((maxSec / 60) * 4) / 4)
  const axisSec = niceMaxMin * 60
  const rows = [
    { label: "Task 1", sec: t1 },
    { label: "Task 2", sec: t2 },
  ]
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMaxMin)
  return (
    <div>
      <h3 className="text-xs font-bold tracking-wide text-muted-foreground uppercase mb-4">Time distribution</h3>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-12 text-xs text-muted-foreground shrink-0">{r.label}</span>
            <div className="flex-1 h-6 rounded-md bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-md bg-primary/90 transition-all duration-700"
                style={{ width: `${clamp((r.sec / axisSec) * 100, 0, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 pl-[60px] text-[11px] text-muted-foreground">
        {ticks.map((t, i) => (
          <span key={i}>{t === 0 ? "0 min" : `${t} min`}</span>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * Page
 * ────────────────────────────────────────────────────────────────────────── */

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<ResultsData | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [tab, setTab] = useState<Tab>("overview")

  // ── Theme toggle (fixes the previously-dead moon button) ──
  const [dark, setDark] = useState(false)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme")
      const prefers = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
      const isDark = saved ? saved === "dark" : prefers
      setDark(isDark)
      document.documentElement.classList.toggle("dark", isDark)
    } catch {
      /* storage/matchMedia unavailable — leave default (light) */
    }
  }, [])
  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      try {
        localStorage.setItem("theme", next ? "dark" : "light")
      } catch {
        /* ignore */
      }
      return next
    })
  }

  // ── Load results from session storage ──
  useEffect(() => {
    const stored = safeSessionStorage.get("ielts_results")
    if (!stored) {
      // Opened directly without finishing a test — send them back.
      router.push("/writing")
      return
    }
    try {
      const parsed = JSON.parse(stored)
      if (!isValidResults(parsed)) {
        setLoadFailed(true)
        return
      }
      setResults(parsed)
    } catch (e) {
      console.warn("Failed to parse stored results", e)
      setLoadFailed(true)
    }
  }, [router])

  // ── Recover any answer text so we can derive sentence/paragraph/unique stats
  //    when the backend didn't send them. Prefer echoed responses; fall back to
  //    the (possibly still-present) autosaved draft. ──
  const answers = useMemo(() => {
    let t1 = results?.task1_response
    let t2 = results?.task2_response
    if (t1 == null || t2 == null) {
      const draftRaw = safeSessionStorage.get("ielts_writing_draft")
      if (draftRaw) {
        try {
          const d = JSON.parse(draftRaw)
          t1 = t1 ?? (typeof d?.task1Text === "string" ? d.task1Text : undefined)
          t2 = t2 ?? (typeof d?.task2Text === "string" ? d.task2Text : undefined)
        } catch {
          /* corrupted draft — ignore */
        }
      }
    }
    return { t1, t2 }
  }, [results])

  // ── Corrupted / unreadable results ──
  if (loadFailed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-foreground font-semibold">Couldn&apos;t load your results</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your results seem to be missing or corrupted in this browser. This can happen after clearing
          site data or opening the page in a new tab. Please retake the test to get a fresh score.
        </p>
        <Button onClick={() => { safeSessionStorage.clear(); router.push("/writing") }} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Start a new test
        </Button>
      </div>
    )
  }

  if (!results) return null

  const {
    task1_score,
    task2_score,
    overall_writing_band,
    strengths,
    improvements,
    test_type,
    time_taken_seconds,
    ai_detection,
  } = results

  const t1 = task1_score as TaskScore
  const t2 = task2_score as TaskScore

  const stats1 = resolveStats(t1, answers.t1)
  const stats2 = resolveStats(t2, answers.t2)

  // Per-task time: authoritative if present, else split the total by word share.
  const totalWords = stats1.words + stats2.words
  const t1Time = t1.time_taken_seconds ?? (totalWords ? (time_taken_seconds * stats1.words) / totalWords : time_taken_seconds / 2)
  const t2Time = t2.time_taken_seconds ?? (totalWords ? (time_taken_seconds * stats2.words) / totalWords : time_taken_seconds / 2)

  const recommendations = results.recommendations?.length ? results.recommendations : improvements ?? []

  const task1Label = test_type === "general" ? "Task 1 — Letter" : "Task 1 — Report"
  const task2Label = "Task 2 — Essay"

  const radar1 = [t1.band_task_achievement, t1.band_coherence_cohesion, t1.band_lexical_resource, t1.band_grammatical_range]
  const radar2 = [t2.band_task_achievement, t2.band_coherence_cohesion, t2.band_lexical_resource, t2.band_grammatical_range]

  const tabs: { id: Tab; label: string; band?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: 1, label: task1Label, band: t1.overall_band },
    { id: 2, label: task2Label, band: t2.overall_band },
  ]

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">

        {/* ── Header ── */}
        <header className="flex items-center gap-3 mb-5">
       
          <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex-1 min-w-0 truncate">
            IELTS Writing Results
          </h1>
          <button
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={dark}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* ── Tab bar ── */}
        <div className="bg-card border border-border rounded-2xl p-1.5 flex flex-col sm:flex-row items-stretch gap-1.5 mb-6">
          {tabs.map((tb) => {
            const active = tab === tb.id
            return (
              <button
                key={String(tb.id)}
                onClick={() => setTab(tb.id)}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tb.label}
                {typeof tb.band === "number" && (
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full tabular-nums",
                      active ? "bg-primary-foreground/20" : "bg-muted"
                    )}
                  >
                    {tb.band}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {tab === "overview" ? (
          <div className="space-y-6">

            {/* ── Row 1: Band · Task scores · Time taken ── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

              {/* Band */}
              <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
                <ScoreRing band={overall_writing_band} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase leading-tight">
                    Your IELTS writing band
                  </p>
                  <p className={cn("text-lg font-bold mt-1", bandToColor(overall_writing_band))}>
                    {bandToLabel(overall_writing_band)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Task 2 weighted 2× more</p>
                </div>
              </div>

              {/* Task scores */}
              <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6">
                <CardEyebrow icon={PencilLine} label="Task scores" />
                <div className="space-y-4">
                  <TaskScoreRow label="Task 1" band={t1.overall_band} words={stats1.words} min={150} />
                  <TaskScoreRow label="Task 2" band={t2.overall_band} words={stats2.words} min={250} />
                </div>
              </div>

              {/* Time taken */}
              <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 flex flex-col">
                <CardEyebrow icon={Clock} label="Time taken" />
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground leading-none tabular-nums">
                    {Math.floor(time_taken_seconds / 60)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">min</span>
                  <span className="text-3xl font-extrabold text-foreground leading-none tabular-nums ml-1">
                    {Math.floor(time_taken_seconds % 60)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">sec</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 mb-3">of 60 minutes allowed</p>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-auto">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${clamp((time_taken_seconds / (60 * 60)) * 100, 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* ── Word count overview ── */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <CardEyebrow icon={TypeIcon} label="Word count overview" tint="text-sky-500 bg-sky-500/10" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <WordCountCard label="Task 1" stats={stats1} min={150} />
                <WordCountCard label="Task 2" stats={stats2} min={250} />
              </div>
            </div>

            {/* ── Criteria comparison · Band score scale ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-3xl p-6">
                <CardEyebrow icon={Target} label="Criteria comparison" tint="text-sky-500 bg-sky-500/10" />
                <CriteriaRadar task1={radar1} task2={radar2} />
                <div className="flex items-center justify-center gap-6 mt-2">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-4 h-0.5 rounded-full bg-sky-400" /> Task 1
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-4 h-0.5 rounded-full bg-blue-600" /> Task 2
                  </span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-6 flex flex-col">
                <CardEyebrow icon={TrendingUp} label="Band score scale" />
                <BandScale band={overall_writing_band} />
                <div className="border-t border-border my-6" />
                <TimeDistribution t1={t1Time} t2={t2Time} />
              </div>
            </div>

            {/* ── Authenticity check (re-added from the previous design) ── */}
            {ai_detection && (
              <div className="bg-card border border-border rounded-3xl p-6">
                <CardEyebrow icon={ShieldCheck} label="Authenticity check" tint="text-violet-500 bg-violet-500/10" />
                <AiDetectionCard data={ai_detection} />
              </div>
            )}

            {/* ── Recommendations ── */}
            {recommendations.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-6">
                <CardEyebrow icon={Lightbulb} label="Recommendations" tint="text-amber-500 bg-amber-500/10" />
                <div className="space-y-2.5">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold flex items-center justify-center tabular-nums">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground/90">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Task summary cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 1 as const, label: task1Label, stats: stats1, band: t1.overall_band },
                { id: 2 as const, label: task2Label, stats: stats2, band: t2.overall_band },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setTab(c.id)}
                  className="group bg-card border border-border rounded-3xl p-5 flex items-center gap-4 text-left hover:shadow-sm hover:border-muted-foreground/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="w-12 h-12 shrink-0 rounded-full bg-rose-500/10 text-rose-500 text-lg font-bold flex items-center justify-center tabular-nums">
                    {c.band}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{c.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.stats.words} words · {c.stats.paragraphs} paragraphs
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>

            {/* ── Actions ── */}
            <div className="bg-card border border-border rounded-3xl p-3 flex flex-col sm:flex-row gap-3">
               <Button
                            variant="outline"
                            className="sm:flex-[2] h-12 rounded-2xl gap-2"
                            onClick={() => { try { router.push("/"); } catch { /* noop */ } }}
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                          </Button>
              <Button
                variant="outline"
                className="sm:flex-[2] h-12 rounded-2xl gap-2"
                onClick={() => setTab(1)}
              >
                <Eye className="w-4 h-4" />
                Review responses
              </Button>
                
              <Button
                className="sm:flex-[3] h-12 rounded-2xl gap-2"
                onClick={() => { safeSessionStorage.clear(); router.push("/writing") }}
              >
                <RotateCcw className="w-4 h-4" />
                Retake test
              </Button>
            </div>
          </div>
        ) : (
          <TaskDetail
            score={tab === 1 ? t1 : t2}
            answerText={tab === 1 ? answers.t1 : answers.t2}
            isTask1={tab === 1}
            min={tab === 1 ? 150 : 250}
            connectiveIdeal={tab === 1 ? 4 : 6}
            onRetake={() => { safeSessionStorage.clear(); router.push("/writing") }}
          />
        )}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * Per-task detail view (Task 1 / Task 2 tabs)
 * ────────────────────────────────────────────────────────────────────────── */

/** One stat tile in the top row of the task view. */
function StatTile({
  icon: Icon,
  label,
  value,
  caption,
  tint,
  valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  caption: React.ReactNode
  tint: string
  valueClass?: string
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("w-6 h-6 rounded-lg flex items-center justify-center", tint)}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{label}</span>
      </div>
      <div className={cn("text-3xl font-extrabold leading-none tabular-nums", valueClass ?? "text-foreground")}>
        {value}
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">{caption}</p>
    </div>
  )
}

/** Vertical bar chart of the four criterion bands (0–9). */
function CriteriaBars({ bands }: { bands: number[] }) {
  const labels = ["TA", "CC", "LR", "GRA"]
  const max = 9
  const W = 320
  const H = 200
  const padL = 26
  const padB = 26
  const padT = 10
  const plotH = H - padT - padB
  const plotW = W - padL
  const y = (v: number) => padT + plotH * (1 - v / max)
  const cols = bands.length
  const colW = plotW / cols
  const barW = 34
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Criteria scores bar chart">
      {[0, 3, 6, 9].map((v) => (
        <g key={v}>
          <line x1={padL} y1={y(v)} x2={W} y2={y(v)} stroke="currentColor" strokeWidth={1} strokeDasharray="3 3" className="text-border" />
          <text x={padL - 8} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{v}</text>
        </g>
      ))}
      {bands.map((b, i) => {
        const cx = padL + colW * i + colW / 2
        const top = y(clamp(b, 0, max))
        const h = padT + plotH - top
        return (
          <g key={i}>
            <rect x={cx - barW / 2} y={top} width={barW} height={Math.max(0, h)} rx={5} className="fill-rose-500" />
            <text x={cx} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[11px] font-medium">{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}

/** One row in the "Writing metrics" list. */
function MetricRow({
  label,
  ideal,
  value,
  ok,
}: {
  label: string
  ideal: string
  value: string
  ok: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Ideal: {ideal}</p>
      </div>
      <div className={cn("flex items-center gap-1.5 shrink-0 text-sm font-semibold", ok ? "text-emerald-600" : "text-amber-600")}>
        {value}
        <Info className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
      </div>
    </div>
  )
}

/** One expandable criterion in "Detailed criteria feedback". */
function FeedbackRow({
  band,
  label,
  feedback,
  expanded,
  onToggle,
  children,
}: {
  band: number
  label: string
  feedback: string
  expanded: boolean
  onToggle: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="w-9 h-9 shrink-0 rounded-full bg-rose-500/10 text-rose-500 text-sm font-bold flex items-center justify-center tabular-nums">
          {band}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className={cn("text-xs text-muted-foreground", expanded ? "" : "truncate")}>{feedback}</p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && children && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  )
}

function TaskDetail({
  score,
  answerText,
  isTask1,
  min,
  connectiveIdeal,
  onRetake,
}: {
  score: TaskScore
  answerText?: string
  isTask1: boolean
  min: number
  connectiveIdeal: number
  onRetake: () => void
}) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showResponse, setShowResponse] = useState(false)
  const m = useMemo(() => computeMetrics(score, answerText), [score, answerText])

  const wordsOk = m.words >= min
  const richnessPct = Math.round(m.richnessPct)

  const criteria = [
    {
      label: isTask1 ? "Task Achievement" : "Task Response",
      band: score.band_task_achievement,
      feedback: score.feedback_task_achievement,
      errors: false,
    },
    {
      label: "Coherence & Cohesion",
      band: score.band_coherence_cohesion,
      feedback: score.feedback_coherence_cohesion,
      errors: false,
    },
    {
      label: "Lexical Resource",
      band: score.band_lexical_resource,
      feedback: score.feedback_lexical_resource,
      errors: false,
    },
    {
      label: "Grammatical Range & Accuracy",
      band: score.band_grammatical_range,
      feedback: score.feedback_grammatical_range,
      errors: true, // surface the error corrections under this one
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Top stat tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={Trophy}
          label="Band score"
          tint="text-primary bg-primary/10"
          value={score.overall_band}
          caption={bandToLabel(score.overall_band)}
        />
        <StatTile
          icon={TypeIcon}
          label="Words"
          tint="text-amber-500 bg-amber-500/10"
          value={m.words}
          valueClass={wordsOk ? "text-foreground" : "text-amber-500"}
          caption={<span className={wordsOk ? "" : "text-amber-500"}>/ {min} required</span>}
        />
        <StatTile
          icon={Hash}
          label="Structure"
          tint="text-slate-500 bg-slate-500/10"
          value={m.paragraphs}
          caption={`paragraphs · ${m.sentences} sentences`}
        />
        <StatTile
          icon={Sparkles}
          label="Vocabulary"
          tint="text-violet-500 bg-violet-500/10"
          value={`${richnessPct}%`}
          caption={`${m.unique} unique words`}
        />
      </div>

      {/* ── Criteria scores · Writing metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-3xl p-6">
          <CardEyebrow icon={Target} label="Criteria scores" tint="text-sky-500 bg-sky-500/10" />
          <CriteriaBars
            bands={[
              score.band_task_achievement,
              score.band_coherence_cohesion,
              score.band_lexical_resource,
              score.band_grammatical_range,
            ]}
          />
        </div>

        <div className="bg-card border border-border rounded-3xl p-6">
          <CardEyebrow icon={FileText} label="Writing metrics" tint="text-sky-500 bg-sky-500/10" />
          <div className="space-y-4">
            <MetricRow
              label="Average Sentence Length"
              ideal="12–22 words"
              value={`${Math.round(m.avgSentenceLength)} words`}
              ok={m.avgSentenceLength >= 12 && m.avgSentenceLength <= 22}
            />
            <MetricRow
              label="Average Word Length"
              ideal="4.5–5.5 chars"
              value={`${m.avgWordLength ? m.avgWordLength.toFixed(1) : 0} chars`}
              ok={m.avgWordLength >= 4.5 && m.avgWordLength <= 5.5}
            />
            <MetricRow
              label="Connective Devices"
              ideal={`${connectiveIdeal}+ recommended`}
              value={`${m.connectives} found`}
              ok={m.connectives >= connectiveIdeal}
            />
            <MetricRow
              label="Vocabulary Richness"
              ideal="45%+ recommended"
              value={`${richnessPct}%`}
              ok={richnessPct >= 45}
            />
          </div>
        </div>
      </div>

      {/* ── Detailed criteria feedback ── */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <CardEyebrow icon={Eye} label="Detailed criteria feedback" />
        <div className="space-y-3">
          {criteria.map((c, i) => (
            <FeedbackRow
              key={c.label}
              band={c.band}
              label={c.label}
              feedback={c.feedback}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            >
              {c.errors && score.errors?.length > 0 && (
                <div className="mt-2">
                  <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase mb-2">
                    Specific corrections
                  </p>
                  <ErrorList errors={score.errors} />
                </div>
              )}
            </FeedbackRow>
          ))}
        </div>
      </div>

      {/* ── Optional: reveal the candidate's own response ── */}
      {showResponse && (
        <div className="bg-card border border-border rounded-3xl p-6">
          <CardEyebrow icon={PencilLine} label="Your response" tint="text-primary bg-primary/10" />
          {answerText && answerText.trim() ? (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{answerText}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your written response isn&apos;t available on this device. Responses are kept only for the
              current session, so they can&apos;t be shown after it ends.
            </p>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="bg-card border border-border rounded-3xl p-3 flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="sm:flex-[2] h-12 rounded-2xl gap-2"
          onClick={() => setShowResponse((s) => !s)}
        >
          <Eye className="w-4 h-4" />
          {showResponse ? "Hide response" : "Review responses"}
        </Button>
        <Button className="sm:flex-[3] h-12 rounded-2xl gap-2" onClick={onRetake}>
          <RotateCcw className="w-4 h-4" />
          Retake test
        </Button>
      </div>
    </div>
  )
}