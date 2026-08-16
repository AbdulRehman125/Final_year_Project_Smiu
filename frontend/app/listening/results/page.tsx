"use client";

// app/listening/results/page.tsx — IELTS Listening Results Dashboard

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RotateCcw,
  Target,
  Clock,
  LayoutGrid,
  AlertCircle,
  Lightbulb,
  Eye,
  CheckCircle,
  Mail,
  Home,
  Sparkles,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { BandScoreScale } from "@/components/listening/band-score-scale";
import { SectionPerformanceBar } from "@/components/listening/section-performance-bar";
import { AnswerReviewCard } from "@/components/listening/answer-review-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import type { ListeningEvaluationResponse } from "@/lib/listening-types";
import { safeSessionStorage } from "@/lib/reading-network-utils";
import { trpc } from "@/server/client";

function formatDurationComponents(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return { m, s };
}

// ── Question Review Section with Tab Switching (All / Incorrect / Correct) ──
function QuestionReviewSection({
  questionResults,
}: {
  questionResults: any[];
}) {
  const [filter, setFilter] = useState<"all" | "incorrect" | "correct">("all");

  const incorrectCount = questionResults.filter((q) => !q.isCorrect).length;
  const correctCount = questionResults.filter((q) => q.isCorrect).length;

  const filtered = questionResults.filter((q) => {
    if (filter === "incorrect") return !q.isCorrect;
    if (filter === "correct") return q.isCorrect;
    return true;
  });

  return (
    <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-sky-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
            QUESTION REVIEW ({questionResults.length} QUESTIONS)
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filter === "all"
                ? "bg-white dark:bg-card text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            All ({questionResults.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("incorrect")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filter === "incorrect"
                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            Incorrect ({incorrectCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("correct")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              filter === "correct"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            Correct ({correctCount})
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No questions match this filter.
          </div>
        ) : (
          filtered.map((q) => <AnswerReviewCard key={q.index} result={q} />)
        )}
      </div>
    </div>
  );
}

function ListeningResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<ListeningEvaluationResponse | null>(null);
  const [error, setError] = useState(false);

  // Email modal / unlock state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Better Auth user session check
  const { data: userSession } = trpc.user.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    let parsed: ListeningEvaluationResponse | null = null;
    try {
      const stored = safeSessionStorage.getItem<ListeningEvaluationResponse>(
        "listening_results"
      );
      if (stored) parsed = stored;
    } catch {
      /* ignore */
    }

    const res = parsed;
    queueMicrotask(() => {
      if (res) setResults(res);
      else setError(true);
    });
  }, [searchParams]);

  const handleSendReport = async () => {
    if (!results || sendingEmail) return;
    setSendingEmail(true);

    try {
      const response = await fetch("/api/listening/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userSession?.email,
          results,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        setShowEmailModal(false);
      } else {
        alert("Failed to send email report. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending report.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-slate-500">Listening result data not found.</p>
          <Button onClick={() => router.push("/listening")}>Take Test Again</Button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { m: minutes, s: seconds } = formatDurationComponents(
    results.timeTakenSeconds
  );
  const incorrectCount = 40 - results.score;

  // Chart configuration & data for Recharts Time Distribution (4 Listening Sections)
  const totalMins = Math.max(results.timeTakenSeconds / 60, 1);
  const s1Mins = Number((totalMins * 0.23).toFixed(1));
  const s2Mins = Number((totalMins * 0.27).toFixed(1));
  const s3Mins = Number((totalMins * 0.25).toFixed(1));
  const s4Mins = Number((totalMins * 0.25).toFixed(1));

  const chartData = [
    { section: "Section 1", minutes: s1Mins },
    { section: "Section 2", minutes: s2Mins },
    { section: "Section 3", minutes: s3Mins },
    { section: "Section 4", minutes: s4Mins },
  ];

  const chartConfig = {
    minutes: {
      label: "Time (mins)",
      color: "#0284c7",
    },
  } satisfies ChartConfig;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background text-slate-900 dark:text-slate-100 py-8 px-4 md:px-6">
      <div className=" mx-auto space-y-6">
        {/* ── Top Header with Home & New Test Buttons ── */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-sm">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
                IELTS LISTENING RESULTS
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Academic Listening Evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 text-xs font-semibold border-slate-200 hover:bg-slate-50"
              onClick={() => router.push("/")}
            >
              <Home className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Home
            </Button>
            <Button
              size="sm"
              className="rounded-full px-4 text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm"
              onClick={() => {
                safeSessionStorage.removeItem("ielts_listening_draft");
                router.push("/listening/test?fresh=true");
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              New Test
            </Button>
          </div>
        </div>

        {/* ── 1. Top Stat Cards (3 Cards) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Band Score */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 flex items-center gap-5 shadow-sm">
            <div className="w-16 h-16 rounded-full border-[3px] border-[#0284c7] flex flex-col items-center justify-center bg-white dark:bg-card shadow-sm shrink-0">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100 leading-none">
                {results.bandScore.toFixed(1)}
              </span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 leading-none">
                of 9.0
              </span>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                YOUR IELTS LISTENING BAND
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {results.score} / 40
              </div>
              <div className="text-[11px] text-slate-400">Raw Score</div>
            </div>
          </div>

          {/* Card 2: Accuracy */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 flex flex-col justify-between shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <Target className="w-3.5 h-3.5 text-sky-500" />
              ACCURACY
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {results.accuracy.toFixed(0)}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-700"
                style={{ width: `${results.accuracy}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>{results.score} correct</span>
              <span>{incorrectCount} incorrect</span>
            </div>
          </div>

          {/* Card 3: Time Taken */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 flex flex-col justify-between shadow-sm space-y-2">
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              TIME TAKEN
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {minutes} <span className="text-base font-bold text-slate-600">min</span> {seconds}{" "}
              <span className="text-base font-bold text-slate-600">sec</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              of 30 minutes allowed
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    (results.timeTakenSeconds / 1800) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ── 2. Question Overview Grid (1-40) ── */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                QUESTION OVERVIEW
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Correct
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Incorrect
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                Unanswered
              </span>
            </div>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5">
            {results.questionResults.map((q) => {
              const isAns = q.userAnswer.trim().length > 0;
              const colorClass = !isAns
                ? "bg-slate-50 text-slate-400 border-slate-200"
                : q.isCorrect
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold"
                : "bg-rose-50 text-rose-700 border-rose-200 font-bold";

              return (
                <div
                  key={q.index}
                  className={cn(
                    "h-8 rounded-xl border text-xs flex items-center justify-center transition-all",
                    colorClass
                  )}
                >
                  {q.index}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Band Score Scale & Question Type Performance (2 Columns) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <BandScoreScale bandScore={results.bandScore} />

          {/* Question Type Performance */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                QUESTION TYPE PERFORMANCE
              </h3>
            </div>

            <div className="space-y-3 pt-1">
              {results.questionTypeScores.map((qt) => (
                <div key={qt.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {qt.label}
                    </span>
                    <span className="text-slate-400 font-bold text-[11px]">
                      {qt.correct}/{qt.total}{" "}
                      <span className="text-slate-500 font-semibold">
                        ({qt.percentage.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        qt.percentage >= 60 ? "bg-sky-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${qt.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. Section Performance & Recharts Time Distribution (2 Columns) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Section Performance */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
              SECTION PERFORMANCE
            </h3>

            <div className="space-y-1">
              {results.sectionScores.map((ss) => (
                <SectionPerformanceBar key={ss.sectionIndex} score={ss} />
              ))}
            </div>
          </div>

          {/* Time Distribution via Shadcn / Recharts BarChart */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                TIME DISTRIBUTION
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Minutes per section
              </span>
            </div>

            <div className="pt-2">
              <ChartContainer config={chartConfig} className="h-44 w-full aspect-auto">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="section"
                    tickLine={false}
                    tickMargin={8}
                    axisLine={false}
                    className="text-[11px] font-bold fill-slate-500"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={4}
                    unit="m"
                    className="text-[10px] fill-slate-400"
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(2, 132, 199, 0.06)" }}
                    content={<ChartTooltipContent hideIndicator />}
                  />
                  <Bar
                    dataKey="minutes"
                    fill="#0284c7"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* ── 5. Question Review Section with Tabs (All / Incorrect / Correct) ── */}
        <div id="review-section">
          <QuestionReviewSection questionResults={results.questionResults} />
        </div>

        {/* ── 6. Recommendations ── */}
        {results.recommendations?.length > 0 && (
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                RECOMMENDATIONS
              </h3>
            </div>

            <div className="space-y-2.5">
              {results.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 rounded-2xl p-3.5 flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 7. Save or Email PDF Report Action Banner ── */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Save or Email Your PDF Report
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Get a full breakdown sent to your email address.
            </p>
          </div>

          {emailSent ? (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4" /> PDF Report Emailed!
            </div>
          ) : (
            <Button
              className="h-10 rounded-full px-6 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-[0_3px_12px_rgba(2,132,199,0.25)] transition-all"
              disabled={sendingEmail}
              onClick={() => {
                if (userSession?.email) {
                  handleSendReport();
                } else {
                  setShowEmailModal(true);
                }
              }}
            >
              <Mail className="w-3.5 h-3.5 mr-2" />
              {sendingEmail ? "Sending..." : "Get My Full Report"}
            </Button>
          )}
        </div>

        {/* ── 8. Bottom Action Buttons (Review / Retake / Back to Home) ── */}
        {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto rounded-full px-6 h-11 text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            onClick={() => {
              const el = document.getElementById("review-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Eye className="w-4 h-4 mr-2 text-slate-500" />
            Review Answers
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none rounded-full px-6 h-11 text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              onClick={() => router.push("/")}
            >
              <Home className="w-4 h-4 mr-2 text-slate-500" />
              Back to Home
            </Button>

            <Button
              className="flex-1 sm:flex-none rounded-full px-8 h-11 text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[0_4px_14px_rgba(2,132,199,0.3)] transition-all"
              onClick={() => {
                safeSessionStorage.removeItem("ielts_listening_draft");
                router.push("/listening/test?fresh=true");
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Practice Again
            </Button>
          </div>
        </div> */}
      </div>

      {/* ── Unlock / Email Modal for non-logged-in users ── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-card border border-slate-200 dark:border-border rounded-[28px] p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0284c7] flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase">
                Unlock Your Full IELTS Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Sign in to save your results, track your progress over time, and receive a complete PDF breakdown in your email.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                className="w-full h-11 rounded-full text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-sm"
                onClick={() => router.push("/auth/sign-in")}
              >
                Sign In to Get Report
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <button
                type="button"
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors block mx-auto"
                onClick={() => setShowEmailModal(false)}
              >
                Continue without saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ListeningResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ListeningResultsContent />
    </Suspense>
  );
}
