
"use client";

// app/speaking/results/page.tsx — IELTS Speaking results (new dashboard design)
//
// Rebuilt to match the approved Figma "IELTS Speaking Results" design, and
// wired to real data. A few panels need data the raw evaluation doesn't carry
// (the conversation transcript, total speaking time, response count); the test
// page now embeds those into `speaking_results`, and everything degrades
// gracefully if they're absent.
//
// Optional fields consumed (all safe if missing):
//   transcript?:            { role: "examiner" | "user"; text: string }[]
//   total_speaking_seconds? number     response_count? number
//   time_taken_seconds?     number      recommendations? string[]

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Moon,
  Sun,
  Trophy,
  Mic,
  Clock,
  Target,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  RotateCcw,
  Info,
  ChevronDown,
  Eye,
  CheckCircle2,
  SpellCheck,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface CriterionScore {
  band: number;
  feedback: string;
  examples: string[];
  improvements: string[];
}

interface TranscriptTurn {
  role: "examiner" | "user";
  text: string;
}

interface SpeakingResult {
  fluency_coherence: CriterionScore;
  lexical_resource: CriterionScore;
  grammatical_range: CriterionScore;
  pronunciation: CriterionScore;
  overall_band: number;
  general_feedback: string;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
  time_taken_seconds?: number;
  total_speaking_seconds?: number;
  response_count?: number;
  transcript?: TranscriptTurn[];
}

const CRITERIA = [
  { key: "fluency_coherence", label: "Fluency & Coherence", short: "FC", Icon: MessageSquare },
  { key: "pronunciation", label: "Pronunciation", short: "P", Icon: Mic },
  { key: "grammatical_range", label: "Grammatical Range", short: "GRA", Icon: SpellCheck },
  { key: "lexical_resource", label: "Lexical Resource", short: "LR", Icon: BookOpen },
] as const;

/* ── Helpers ───────────────────────────────────────────────────────────── */

function bandToLabel(band: number): string {
  if (band >= 8.5) return "Expert";
  if (band >= 7.5) return "Very Good";
  if (band >= 6.5) return "Competent";
  if (band >= 5.5) return "Modest";
  if (band >= 4.5) return "Limited";
  if (band > 0) return "Developing";
  return "N/A";
}

function bandToColor(band: number): string {
  if (band >= 7.5) return "text-emerald-600 dark:text-emerald-400";
  if (band >= 6.5) return "text-blue-600 dark:text-blue-400";
  if (band >= 5.5) return "text-amber-600 dark:text-amber-400";
  if (band >= 4.5) return "text-orange-600 dark:text-orange-400";
  if (band > 0) return "text-red-600 dark:text-red-400";
  return "text-muted-foreground";
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function fmtBand(band: number): string {
  return Number.isInteger(band) ? String(band) : band.toFixed(1);
}

function fmtMMSS(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Structural check so a corrupted/partial payload never crashes the page. */
function isValidResult(v: unknown): v is SpeakingResult {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  const criteriaOk = CRITERIA.every((c) => {
    const s = r[c.key] as Record<string, unknown> | undefined;
    return s && typeof s.band === "number";
  });
  return criteriaOk && typeof r.overall_band === "number";
}

/* ── Small presentational primitives ───────────────────────────────────── */

function CardEyebrow({
  icon: Icon,
  label,
  badge,
  tint = "text-primary bg-primary/10",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
  tint?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center", tint)}>
        <Icon className="w-4 h-4" />
      </span>
      <h2 className="text-sm font-bold tracking-wide text-foreground uppercase">{label}</h2>
      {badge && (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {badge}
        </span>
      )}
    </div>
  );
}

/** Hero band ring: light track + proportional blue arc, band in the middle. */
function ScoreRing({ band, max = 9 }: { band: number; max?: number }) {
  const size = 128;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp(band / max, 0, 1);
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
        <span className="text-3xl font-extrabold text-foreground leading-none">{fmtBand(band)}</span>
        <span className="text-[11px] text-muted-foreground mt-0.5">of {max.toFixed(1)}</span>
      </div>
    </div>
  );
}

/** One compact criterion tile (icon, label, band, bar). */
function CriterionTile({
  icon: Icon,
  label,
  band,
  max = 9,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  band: number;
  max?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5" />
        </span>
        <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase truncate">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-rose-500 leading-none tabular-nums mb-3">{fmtBand(band)}</div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-rose-500 transition-all duration-700"
          style={{ width: `${clamp((band / max) * 100, 0, 100)}%` }}
        />
      </div>
    </div>
  );
}

/** Dependency-free radar for the four speaking criteria (0–9 scale). */
function CriteriaRadar({ values, max = 9 }: { values: number[]; max?: number }) {
  const axes = ["FC", "P", "GRA", "LR"]; // top, right, bottom, left
  const cx = 150;
  const cy = 140;
  const R = 92;
  const labelR = 116;
  const angle = (i: number) => (-90 + i * 90) * (Math.PI / 180);
  const point = (i: number, value: number, radius = R) => {
    const rr = (clamp(value, 0, max) / max) * radius;
    return [cx + rr * Math.cos(angle(i)), cy + rr * Math.sin(angle(i))] as const;
  };
  const rings = [max / 3, (2 * max) / 3, max];
  const hasArea = values.some((v) => v > 0);

  return (
    <svg viewBox="0 0 300 285" className="w-full max-w-[340px] mx-auto" role="img" aria-label="Criteria profile radar chart">
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
      {axes.map((_, i) => {
        const [x, y] = point(i, max);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeWidth={1} className="text-border" />;
      })}
      {hasArea && (
        <polygon
          points={values.map((v, i) => point(i, v).join(",")).join(" ")}
          fill="rgb(37 99 235 / 0.18)"
          stroke="rgb(37 99 235)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
      {axes.map((label, i) => {
        const [x, y] = point(i, max, labelR);
        const anchor = i === 1 ? "start" : i === 3 ? "end" : "middle";
        const dy = i === 0 ? -2 : i === 2 ? 12 : 4;
        return (
          <text key={label} x={x} y={y + dy} textAnchor={anchor} className="fill-muted-foreground text-[11px] font-medium">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/** Gradient band scale (4–9) with a marker at the overall band. */
function BandScale({ band }: { band: number }) {
  const min = 4;
  const max = 9;
  const pos = clamp(((band - min) / (max - min)) * 100, 0, 100);
  const ticks = [4, 5, 6, 7, 8, 9];
  const nearest = Math.round(band);
  return (
    <div className="pt-4">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase mb-4">Band score scale</p>
      <div className="relative h-2.5 rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
        <div className="absolute -top-9 -translate-x-1/2 flex flex-col items-center" style={{ left: `${pos}%` }}>
          <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
            {fmtBand(band)}
          </span>
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20 border-2 border-background"
          style={{ left: `${pos}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 px-0.5">
        {ticks.map((t) => (
          <span key={t} className={cn("text-xs tabular-nums", t === nearest && band > 0 ? "font-bold text-primary" : "text-muted-foreground")}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/** One expandable criterion in "Detailed feedback". */
function FeedbackRow({
  band,
  label,
  score,
  expanded,
  onToggle,
}: {
  band: number;
  label: string;
  score: CriterionScore;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="w-9 h-9 shrink-0 rounded-full bg-rose-500/10 text-rose-500 text-sm font-bold flex items-center justify-center tabular-nums">
          {fmtBand(band)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className={cn("text-xs text-muted-foreground", expanded ? "" : "truncate")}>
            {score.feedback || bandToLabel(band)}
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-4">
          {score.feedback && <p className="text-sm text-muted-foreground leading-relaxed">{score.feedback}</p>}

          {score.examples?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">From your responses</p>
              <div className="space-y-1.5">
                {score.examples.map((ex, i) => (
                  <div key={i} className="bg-muted/40 rounded-lg px-3 py-2 text-sm text-muted-foreground italic">
                    &ldquo;{ex}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}

          {score.improvements?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">How to improve</p>
              <ul className="space-y-1.5">
                {score.improvements.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default function SpeakingResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<SpeakingResult | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(CRITERIA[0].key);

  // Theme toggle (working — fixes the previously-dead moon button).
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefers = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
      const isDark = saved ? saved === "dark" : prefers;
      setDark(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    } catch {
      /* ignore */
    }
  }, []);
  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  useEffect(() => {
    let parsed: unknown = null;
    try {
      const stored = sessionStorage.getItem("speaking_results");
      if (stored) parsed = JSON.parse(stored);
    } catch {
      /* ignore */
    }
    if (!parsed) {
      const data = searchParams.get("data");
      if (data) {
        try {
          parsed = JSON.parse(decodeURIComponent(data));
        } catch {
          /* ignore */
        }
      }
    }
    if (parsed && isValidResult(parsed)) setResult(parsed);
    else setLoadFailed(true);
  }, [searchParams]);

  const transcript = result?.transcript ?? [];

  const recommendations = useMemo(() => {
    if (!result) return [];
    const base =
      result.recommendations?.length
        ? result.recommendations
        : result.improvements?.length
        ? result.improvements
        : CRITERIA.flatMap((c) => result[c.key]?.improvements ?? []).slice(0, 6);
    return base.length ? base : ["Complete the speaking test to receive feedback."];
  }, [result]);

  // ── Corrupted / missing results ──
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
        <Button onClick={() => { try { sessionStorage.removeItem("speaking_results"); } catch { /* noop */ } router.push("/speaking/test"); }} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Take test again
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const responseCount = result.response_count ?? transcript.filter((t) => t.role === "user").length;
  const totalSpeaking = result.total_speaking_seconds ?? 0;
  const avgResponse = responseCount > 0 ? Math.round(totalSpeaking / responseCount) : 0;
  const duration = result.time_taken_seconds ?? 0;
  const scored = responseCount > 0 && result.overall_band > 0;

  const radarValues = CRITERIA.map((c) => result[c.key]?.band ?? 0);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">

        {/* ── Header ── */}
        <header className="flex items-center gap-3 mb-6">
       
          <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex-1 min-w-0 truncate">
            IELTS Speaking Results
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

        <div className="space-y-6">

          {/* ── Row 1: Band · Speaking stats · Duration ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Band */}
            <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
              <ScoreRing band={result.overall_band} />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase leading-tight">
                  Your IELTS speaking band
                </p>
                <p className={cn("text-lg font-bold mt-1", bandToColor(result.overall_band))}>
                  {scored ? bandToLabel(result.overall_band) : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{responseCount} responses evaluated</p>
              </div>
            </div>

            {/* Speaking stats */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <CardEyebrow icon={Mic} label="Speaking stats" tint="text-sky-500 bg-sky-500/10" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-extrabold text-foreground leading-none tabular-nums">{fmtMMSS(totalSpeaking)}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">Total speaking</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground leading-none tabular-nums">{avgResponse}s</p>
                  <p className="text-xs text-muted-foreground mt-1.5">Avg. response</p>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-card border border-border rounded-3xl p-6 flex flex-col">
              <CardEyebrow icon={Clock} label="Test duration" />
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground leading-none tabular-nums">{Math.floor(duration / 60)}</span>
                <span className="text-sm font-medium text-muted-foreground">min</span>
                <span className="text-3xl font-extrabold text-foreground leading-none tabular-nums ml-1">{Math.floor(duration % 60)}</span>
                <span className="text-sm font-medium text-muted-foreground">sec</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 mb-3">11–14 minutes typical</p>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-auto">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${clamp((duration / (14 * 60)) * 100, 0, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── Row 2: 4 criteria tiles ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CRITERIA.map((c) => (
              <CriterionTile key={c.key} icon={c.Icon} label={c.label} band={result[c.key]?.band ?? 0} />
            ))}
          </div>

          {/* ── Row 3: Criteria profile · Part performance ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-3xl p-6">
              <CardEyebrow icon={Target} label="Criteria profile" tint="text-sky-500 bg-sky-500/10" />
              <CriteriaRadar values={radarValues} />
            </div>
            <div className="bg-card border border-border rounded-3xl p-6 flex flex-col">
              <CardEyebrow icon={TrendingUp} label="Part performance" />
              <BandScale band={result.overall_band} />
              {result.general_feedback && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-6 pt-6 border-t border-border">
                  {result.general_feedback}
                </p>
              )}
            </div>
          </div>

          {/* ── Detailed feedback (kept from the previous report) ── */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <CardEyebrow icon={Eye} label="Detailed criteria feedback" />
            <div className="space-y-3">
              {CRITERIA.map((c) => (
                <FeedbackRow
                  key={c.key}
                  band={result[c.key]?.band ?? 0}
                  label={c.label}
                  score={result[c.key]}
                  expanded={expanded === c.key}
                  onToggle={() => setExpanded(expanded === c.key ? null : c.key)}
                />
              ))}
            </div>
            {/* Pronunciation disclaimer (kept from the previous report) */}
            <div className="mt-4 flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-4 py-3">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-amber-600 dark:text-amber-400">Note:</span>{" "}
                Pronunciation is estimated from a transcript-based analysis. In a real IELTS test, a
                certified examiner evaluates your actual speech in person.
              </p>
            </div>
          </div>

          {/* ── Conversation review ── */}
          <div className="bg-card border border-border rounded-3xl p-6">
            <CardEyebrow
              icon={MessageSquare}
              label="Conversation review"
              tint="text-sky-500 bg-sky-500/10"
              badge={transcript.length > 0 ? `${transcript.length} turns` : undefined}
            />
            {transcript.length > 0 ? (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {transcript.map((turn, i) => {
                  const isUser = turn.role === "user";
                  return (
                    <div key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                      <div className="max-w-[85%]">
                        <p className={cn("text-[10px] font-semibold uppercase tracking-wide mb-1", isUser ? "text-right text-emerald-500" : "text-sky-500")}>
                          {isUser ? "You" : "AI Examiner"}
                        </p>
                        <div
                          className={cn(
                            "inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            isUser
                              ? "bg-emerald-500/10 text-foreground rounded-tr-sm"
                              : "bg-sky-500/10 text-foreground rounded-tl-sm"
                          )}
                        >
                          {turn.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No conversation was recorded for this test.
              </p>
            )}
          </div>

          {/* ── Recommendations ── */}
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

          {/* ── Strengths (kept from the previous report, when present) ── */}
          {result.strengths && result.strengths.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              className="sm:flex-[3] h-12 rounded-2xl gap-2"
              onClick={() => { try { sessionStorage.removeItem("speaking_results"); } catch { /* noop */ } router.push("/speaking/test"); }}
            >
              <RotateCcw className="w-4 h-4" />
              Retake Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}