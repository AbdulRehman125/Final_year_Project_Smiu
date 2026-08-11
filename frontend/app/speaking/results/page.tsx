// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

// interface CriterionScore {
//   band: number;
//   feedback: string;
//   examples: string[];
//   improvements: string[];
// }

// interface SpeakingResult {
//   fluency_coherence: CriterionScore;
//   lexical_resource: CriterionScore;
//   grammatical_range: CriterionScore;
//   pronunciation: CriterionScore;
//   overall_band: number;
//   general_feedback: string;
// }

// const criteriaConfig = [
//   {
//     key: "fluency_coherence" as keyof SpeakingResult,
//     label: "Fluency & Coherence",
//     short: "FC",
//     color: "bg-blue-500",
//     lightColor: "bg-blue-50",
//     textColor: "text-blue-700",
//     borderColor: "border-blue-200",
//   },
//   {
//     key: "lexical_resource" as keyof SpeakingResult,
//     label: "Lexical Resource",
//     short: "LR",
//     color: "bg-emerald-500",
//     lightColor: "bg-emerald-50",
//     textColor: "text-emerald-700",
//     borderColor: "border-emerald-200",
//   },
//   {
//     key: "grammatical_range" as keyof SpeakingResult,
//     label: "Grammatical Range & Accuracy",
//     short: "GRA",
//     color: "bg-violet-500",
//     lightColor: "bg-violet-50",
//     textColor: "text-violet-700",
//     borderColor: "border-violet-200",
//   },
//   {
//     key: "pronunciation" as keyof SpeakingResult,
//     label: "Pronunciation",
//     short: "P",
//     color: "bg-amber-500",
//     lightColor: "bg-amber-50",
//     textColor: "text-amber-700",
//     borderColor: "border-amber-200",
//   },
// ];

// function BandCircle({
//   band,
//   size = "lg",
//   color = "bg-gray-900",
// }: {
//   band: number;
//   size?: "sm" | "lg" | "xl";
//   color?: string;
// }) {
//   const sizes = {
//     sm: "w-14 h-14 text-lg",
//     lg: "w-20 h-20 text-2xl",
//     xl: "w-28 h-28 text-4xl",
//   };
//   return (
//     <div
//       className={`${sizes[size]} ${color} rounded-full flex flex-col items-center justify-center text-white font-bold flex-shrink-0`}
//     >
//       <span>{band.toFixed(1)}</span>
//       {size === "xl" && (
//         <span className="text-xs font-normal opacity-70 mt-0.5">Band</span>
//       )}
//     </div>
//   );
// }

// function BandBar({ band }: { band: number }) {
//   const pct = (band / 9) * 100;
//   const color =
//     band >= 7
//       ? "bg-emerald-500"
//       : band >= 5.5
//       ? "bg-amber-500"
//       : "bg-red-400";
//   return (
//     <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
//       <div
//         className={`${color} h-2 rounded-full transition-all duration-700`}
//         style={{ width: `${pct}%` }}
//       />
//     </div>
//   );
// }

// function CriterionCard({
//   config,
//   score,
// }: {
//   config: (typeof criteriaConfig)[0];
//   score: CriterionScore;
// }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <div className={`border ${config.borderColor} rounded-xl overflow-hidden`}>
//       {/* Header */}
//       <button
//         onClick={() => setOpen(!open)}
//         className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
//       >
//         <BandCircle band={score.band} size="sm" color={config.color} />
//         <div className="flex-1 min-w-0">
//           <p className="font-medium text-gray-900 text-sm">{config.label}</p>
//           <BandBar band={score.band} />
//         </div>
//         <svg
//           className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
//             open ? "rotate-180" : ""
//           }`}
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M19 9l-7 7-7-7"
//           />
//         </svg>
//       </button>

//       {/* Expanded */}
//       {open && (
//         <div className={`${config.lightColor} px-4 pb-4 space-y-4 border-t ${config.borderColor}`}>
//           {/* Feedback */}
//           <div className="pt-4">
//             <p className="text-sm text-gray-700 leading-relaxed">
//               {score.feedback}
//             </p>
//           </div>

//           {/* Examples */}
//           {score.examples && score.examples.length > 0 && (
//             <div>
//               <p className={`text-xs font-semibold uppercase tracking-wide ${config.textColor} mb-2`}>
//                 From your responses
//               </p>
//               <div className="space-y-1.5">
//                 {score.examples.map((ex, i) => (
//                   <div
//                     key={i}
//                     className="bg-white rounded-lg px-3 py-2 text-sm text-gray-600 border border-white/80 italic"
//                   >
//                     "{ex}"
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Improvements */}
//           {score.improvements && score.improvements.length > 0 && (
//             <div>
//               <p className={`text-xs font-semibold uppercase tracking-wide ${config.textColor} mb-2`}>
//                 How to improve
//               </p>
//               <div className="space-y-1.5">
//                 {score.improvements.map((tip, i) => (
//                   <div key={i} className="flex items-start gap-2">
//                     <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full ${config.color} flex items-center justify-center`}>
//                       <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                       </svg>
//                     </span>
//                     <p className="text-sm text-gray-700">{tip}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function getBandLabel(band: number): { label: string; color: string } {
//   if (band >= 8.5) return { label: "Expert", color: "text-emerald-600" };
//   if (band >= 7.5) return { label: "Very Good", color: "text-emerald-600" };
//   if (band >= 6.5) return { label: "Competent", color: "text-blue-600" };
//   if (band >= 5.5) return { label: "Modest", color: "text-amber-600" };
//   if (band >= 4.5) return { label: "Limited", color: "text-orange-600" };
//   return { label: "Developing", color: "text-red-600" };
// }

// export default function SpeakingResultsPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [result, setResult] = useState<SpeakingResult | null>(null);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     const data = searchParams.get("data");
//     if (!data) { setError(true); return; }
//     try {
//       setResult(JSON.parse(decodeURIComponent(data)));
//     } catch {
//       setError(true);
//     }
//   }, [searchParams]);

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-500 mb-4">Result data not found.</p>
//           <button
//             onClick={() => router.push("/speaking/test")}
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm"
//           >
//             Take Test Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!result) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     );
//   }

//   const { label, color } = getBandLabel(result.overall_band);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
//         <div>
//           <h1 className="text-lg font-semibold text-gray-900">Speaking Results</h1>
//           <p className="text-sm text-gray-500">IELTS Speaking Test</p>
//         </div>
//         <button
//           onClick={() => router.push("/speaking/test")}
//           className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
//         >
//           Take Again
//         </button>
//       </div>

//       <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

//         {/* Overall Band Score */}
//         <div className="bg-white rounded-2xl border p-6 flex items-center gap-6">
//           <BandCircle band={result.overall_band} size="xl" color="bg-gray-900" />
//           <div className="flex-1">
//             <p className="text-sm text-gray-500 mb-1">Overall Band Score</p>
//             <p className={`text-2xl font-bold ${color}`}>{label}</p>
//             <p className="text-sm text-gray-600 mt-2 leading-relaxed">
//               {result.general_feedback}
//             </p>
//           </div>
//         </div>

//         {/* Score breakdown mini bars */}
//         <div className="bg-white rounded-2xl border p-5">
//           <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4">
//             Score Breakdown
//           </p>
//           <div className="grid grid-cols-2 gap-4">
//             {criteriaConfig.map((cfg) => {
//               const score = result[cfg.key] as CriterionScore;
//               return (
//                 <div key={cfg.key}>
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="text-xs text-gray-500">{cfg.short}</span>
//                     <span className={`text-sm font-bold ${cfg.textColor}`}>
//                       {score.band.toFixed(1)}
//                     </span>
//                   </div>
//                   <BandBar band={score.band} />
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Pronunciation disclaimer */}
//         <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
//           <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <p className="text-xs text-amber-700 leading-relaxed">
//             <span className="font-semibold">Note:</span> Pronunciation is scored as a neutral Band 6 because this is a text-based simulation. In a real IELTS test, a certified examiner evaluates your actual speech.
//           </p>
//         </div>

//         {/* Detailed criteria */}
//         <div className="space-y-3">
//           <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
//             Detailed Feedback
//           </p>
//           {criteriaConfig.map((cfg) => (
//             <CriterionCard
//               key={cfg.key}
//               config={cfg}
//               score={result[cfg.key] as CriterionScore}
//             />
//           ))}
//         </div>

//         {/* Band scale reference */}
//         <div className="bg-white rounded-2xl border p-5">
//           <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
//             IELTS Band Scale
//           </p>
//           <div className="space-y-1.5">
//             {[
//               { range: "8.5 – 9.0", label: "Expert", color: "bg-emerald-500" },
//               { range: "7.5 – 8.0", label: "Very Good", color: "bg-emerald-400" },
//               { range: "6.5 – 7.0", label: "Competent", color: "bg-blue-500" },
//               { range: "5.5 – 6.0", label: "Modest", color: "bg-amber-500" },
//               { range: "4.5 – 5.0", label: "Limited", color: "bg-orange-500" },
//               { range: "Below 4.5", label: "Developing", color: "bg-red-400" },
//             ].map((item) => (
//               <div key={item.range} className="flex items-center gap-3">
//                 <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
//                 <span className="text-xs text-gray-500 w-24">{item.range}</span>
//                 <span className="text-xs text-gray-700 font-medium">{item.label}</span>
//                 {result.overall_band >= parseFloat(item.range) &&
//                   result.overall_band <= parseFloat(item.range.split("–")[1] || "9") && (
//                     <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full ml-auto">
//                       You are here
//                     </span>
//                   )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Actions */}
//         <div className="grid grid-cols-2 gap-3 pb-8">
//           <button
//             onClick={() => router.push("/speaking/test")}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-colors"
//           >
//             Practice Again
//           </button>
//           <button
//             onClick={() => router.push("/")}
//             className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl text-sm border transition-colors"
//           >
//             Back to Home
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }























"use client";

// app/speaking/results/page.tsx — IELTS Speaking results (matches Writing module)

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  RotateCcw,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Mic,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────

interface CriterionScore {
  band: number;
  feedback: string;
  examples: string[];
  improvements: string[];
}

interface SpeakingResult {
  fluency_coherence: CriterionScore;
  lexical_resource: CriterionScore;
  grammatical_range: CriterionScore;
  pronunciation: CriterionScore;
  overall_band: number;
  general_feedback: string;
  // Optional — used if the backend provides them; otherwise derived / hidden.
  strengths?: string[];
  improvements?: string[];
  time_taken_seconds?: number;
}

const CRITERIA = [
  { key: "fluency_coherence", label: "Fluency & Coherence", short: "FC" },
  { key: "lexical_resource", label: "Lexical Resource", short: "LR" },
  { key: "grammatical_range", label: "Grammatical Range & Accuracy", short: "GRA" },
  { key: "pronunciation", label: "Pronunciation", short: "P" },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────

function bandToLabel(band: number): string {
  if (band >= 8.5) return "Expert";
  if (band >= 7.5) return "Very Good";
  if (band >= 6.5) return "Competent";
  if (band >= 5.5) return "Modest";
  if (band >= 4.5) return "Limited";
  return "Developing";
}

function bandToColor(band: number): string {
  if (band >= 7.5) return "text-emerald-600 dark:text-emerald-400";
  if (band >= 6.5) return "text-blue-600 dark:text-blue-400";
  if (band >= 5.5) return "text-amber-600 dark:text-amber-400";
  if (band >= 4.5) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function bandRingColor(band: number): string {
  if (band >= 7.5) return "border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
  if (band >= 6.5) return "border-blue-500/30 text-blue-600 dark:text-blue-400";
  if (band >= 5.5) return "border-amber-500/30 text-amber-600 dark:text-amber-400";
  if (band >= 4.5) return "border-orange-500/30 text-orange-600 dark:text-orange-400";
  return "border-red-500/30 text-red-600 dark:text-red-400";
}

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ─── Band circle ─────────────────────────────────────────────────────────

function BandCircle({ band, size = "sm" }: { band: number; size?: "sm" | "lg" }) {
  const dims = size === "lg" ? "w-28 h-28 text-4xl border-4" : "w-14 h-14 text-lg border-2";
  return (
    <div
      className={cn(
        "rounded-full flex flex-col items-center justify-center font-bold bg-card shrink-0",
        dims,
        bandRingColor(band)
      )}
    >
      <span>{band.toFixed(1)}</span>
      {size === "lg" && (
        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">Band</span>
      )}
    </div>
  );
}

// ─── Criterion card (expandable, mirrors the Writing task card) ───────────

function CriterionCard({
  label,
  score,
  expanded,
  onToggle,
}: {
  label: string;
  score: CriterionScore;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden transition-shadow hover:shadow-sm">
      <button
        className="w-full px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <BandCircle band={score.band} size="sm" />
        <div className="flex-1 text-left">
          <div className="font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground">{bandToLabel(score.band)}</div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-border pt-4 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{score.feedback}</p>

          {score.examples?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                From your responses
              </p>
              <div className="space-y-1.5">
                {score.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="bg-muted/40 rounded-lg px-3 py-2 text-sm text-muted-foreground italic"
                  >
                    &ldquo;{ex}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}

          {score.improvements?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                How to improve
              </p>
              <ul className="space-y-1.5">
                {score.improvements.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
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

// ─── Page ────────────────────────────────────────────────────────────────

function SpeakingResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<SpeakingResult | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(CRITERIA[0].key);

  useEffect(() => {
    // Primary source: sessionStorage (set by the test page). Fallback: ?data=
    let parsed: SpeakingResult | null = null;
    try {
      const stored = sessionStorage.getItem("speaking_results");
      if (stored) parsed = JSON.parse(stored) as SpeakingResult;
    } catch {
      /* ignore */
    }
    if (!parsed) {
      const data = searchParams.get("data");
      if (data) {
        try {
          parsed = JSON.parse(decodeURIComponent(data)) as SpeakingResult;
        } catch {
          /* ignore */
        }
      }
    }
    const res = parsed;
    queueMicrotask(() => {
      if (res) setResult(res);
      else setError(true);
    });
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Result data not found.</p>
          <Button onClick={() => router.push("/speaking/test")}>Take Test Again</Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Derive an "improvements" list if the backend didn't send a top-level one.
  const improvements =
    result.improvements && result.improvements.length > 0
      ? result.improvements
      : CRITERIA.flatMap((c) => result[c.key].improvements ?? []).slice(0, 5);

  const strengths = result.strengths ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">

        {/* ── Overall Score Hero ── */}
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-5">
            Your IELTS Speaking Score
          </p>

          <div className="flex justify-center">
            <BandCircle band={result.overall_band} size="lg" />
          </div>

          <p className={cn("text-xl font-semibold mt-4", bandToColor(result.overall_band))}>
            {bandToLabel(result.overall_band)}
          </p>

          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            {result.general_feedback}
          </p>

          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted">
              <Mic className="w-3.5 h-3.5" />
              Speaking Test
            </span>
            {typeof result.time_taken_seconds === "number" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(result.time_taken_seconds)}
              </span>
            )}
          </div>
        </div>

        {/* ── Criteria breakdown ── */}
        <div className="space-y-4 mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Detailed Feedback
          </p>
          {CRITERIA.map((c) => (
            <CriterionCard
              key={c.key}
              label={c.label}
              score={result[c.key]}
              expanded={expanded === c.key}
              onToggle={() => setExpanded(expanded === c.key ? null : c.key)}
            />
          ))}
        </div>

        {/* ── Pronunciation note ── */}
        <div className="mb-8 flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-4 py-3">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Note:</span>{" "}
            Pronunciation is estimated from a transcript-based analysis. In a real IELTS test,
            a certified examiner evaluates your actual speech in person.
          </p>
        </div>

        {/* ── Strengths & Improvements ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {strengths.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Strengths
                </h3>
              </div>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {improvements.length > 0 && (
            <div
              className={cn(
                "bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5",
                strengths.length === 0 && "sm:col-span-2"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  To Improve
                </h3>
              </div>
              <ul className="space-y-2">
                {improvements.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-amber-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => {
              try {
                sessionStorage.removeItem("speaking_results");
              } catch {
                /* noop */
              }
              router.push("/speaking/test");
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button className="flex-1 h-12 rounded-xl" onClick={() => router.push("/")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SpeakingResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SpeakingResultsContent />
    </Suspense>
  );
}