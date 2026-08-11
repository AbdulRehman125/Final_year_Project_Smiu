"use client";

// app/reading/results/page.tsx — IELTS Reading Results Dashboard

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RotateCcw,
  TrendingUp,
  CheckCircle,
  Clock,
  BookOpen,
  Mail,
  Lock,
  Sparkles,
  ChevronRight,
  Info,
  Home,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BandCircle } from "@/components/writing/band-circle";
import { BandScoreScale } from "@/components/reading/band-score-scale";
import { PassagePerformanceBar } from "@/components/reading/passage-performance-bar";
import { AnswerReviewCard } from "@/components/reading/answer-review-card";
import { QuestionTypeBadge } from "@/components/reading/question-type-badge";
import { cn } from "@/lib/utils";

import type { ReadingEvaluationResponse } from "@/lib/reading-types";
import { bandToLabel, bandToColor } from "@/lib/reading-types";
import { safeSessionStorage } from "@/lib/reading-network-utils";
import { trpc } from "@/server/client";

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function QuestionReviewSection({ questionResults }: { questionResults: any[] }) {
  const [filter, setFilter] = useState<"all" | "incorrect" | "correct">("all");

  const filtered = questionResults.filter((q) => {
    if (filter === "incorrect") return !q.isCorrect;
    if (filter === "correct") return q.isCorrect;
    return true;
  });

  const incorrectCount = questionResults.filter((q) => !q.isCorrect).length;
  const correctCount = questionResults.filter((q) => q.isCorrect).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Question Review ({questionResults.length} Questions)
        </h3>

        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition-all",
              filter === "all"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ({questionResults.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("incorrect")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition-all",
              filter === "incorrect"
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Incorrect ({incorrectCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("correct")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-bold transition-all",
              filter === "correct"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Correct ({correctCount})
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((q) => (
          <AnswerReviewCard key={q.index} result={q} />
        ))}
      </div>
    </div>
  );
}

function ReadingResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [results, setResults] = useState<ReadingEvaluationResponse | null>(null);
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
    let parsed: ReadingEvaluationResponse | null = null;
    try {
      const stored = safeSessionStorage.getItem<ReadingEvaluationResponse>("reading_results");
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
      const response = await fetch("/api/reading/send-report", {
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Reading result data not found.</p>
          <Button onClick={() => router.push("/reading")}>Take Test Again</Button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const answeredCount = results.questionResults.filter((q) => q.userAnswer.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">IELTS READING RESULTS</h1>
              <p className="text-xs text-muted-foreground">Official Academic Reading Evaluation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => router.push("/")}
            >
              <Home className="w-4 h-4 mr-1.5" />
              Home
            </Button>
            <Button
              size="sm"
              className="rounded-xl bg-primary"
              onClick={() => {
                safeSessionStorage.removeItem("ielts_reading_draft");
                router.push("/reading/test?fresh=true");
              }}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              New Test
            </Button>
          </div>
        </div>

        {/* ── 1. Top Stat Cards Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Band Score */}
          <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-5 shadow-sm">
            <BandCircle band={results.bandScore} size="lg" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Reading Band
              </div>
              <div className={cn("text-2xl font-extrabold mt-1", bandToColor(results.bandScore))}>
                {bandToLabel(results.bandScore)}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                Raw Score: <span className="font-bold text-foreground">{results.score} / 40</span>
              </div>
            </div>
          </div>

          {/* Card 2: Accuracy */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Accuracy
            </div>
            <div className="text-3xl font-extrabold text-primary">
              ~{results.accuracy.toFixed(0)}%
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${results.accuracy}%` }}
              />
            </div>
          </div>

          {/* Card 3: Time Taken */}
          <div className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Time Taken
            </div>
            <div className="text-3xl font-extrabold text-foreground">
              {formatDuration(results.timeTakenSeconds)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              You answered <span className="font-bold text-foreground">{answeredCount}</span> of 40 questions
            </div>
          </div>
        </div>

        {/* ── 2. Question Overview Grid (1-40) ── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Question Overview
            </h3>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Correct ({results.score})
              </span>
              <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Incorrect ({40 - results.score})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-20 gap-2">
            {results.questionResults.map((q) => {
              const isAns = q.userAnswer.trim().length > 0;
              const colorClass = !isAns
                ? "bg-muted text-muted-foreground border-border"
                : q.isCorrect
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold"
                : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-bold";

              return (
                <div
                  key={q.index}
                  className={cn(
                    "w-8 h-8 rounded-full border text-xs flex items-center justify-center transition-all",
                    colorClass
                  )}
                >
                  {q.index}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 3. Band Scale & Question Type Breakdown ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BandScoreScale bandScore={results.bandScore} />

          {/* Question Type Performance */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Question Type Performance
            </h3>

            <div className="space-y-3">
              {results.questionTypeScores.map((qt) => (
                <div key={qt.type} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
                  <span className="font-medium text-foreground">{qt.label}</span>
                  <span className="font-bold text-muted-foreground">
                    {qt.correct} / {qt.total}{" "}
                    <span className="text-foreground">({qt.percentage.toFixed(0)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. Passage Performance ── */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Passage Performance
          </h3>

          <div className="divide-y divide-border">
            {results.passageScores.map((ps) => (
              <PassagePerformanceBar key={ps.passageIndex} score={ps} />
            ))}
          </div>
        </div>

        {/* ── 5. Question Review Section ── */}
        <QuestionReviewSection questionResults={results.questionResults} />

        {/* ── 6. Recommendations ── */}
        {results.recommendations?.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                RECOMMENDATIONS
              </h3>
            </div>

            <ul className="space-y-2.5">
              {results.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── 7. Email Report Action Bar ── */}
        <div className="bg-card border border-border rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-base font-bold text-foreground">Save or Email Your PDF Report</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get a full breakdown sent to your email address.
            </p>
          </div>

          {emailSent ? (
            <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" /> PDF Report Emailed!
            </div>
          ) : (
            <Button
              className="h-11 rounded-xl px-6 bg-primary"
              onClick={() => {
                if (userSession?.email) {
                  handleSendReport();
                } else {
                  setShowEmailModal(true);
                }
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Get My Full Report
            </Button>
          )}
        </div>

        {/* ── 8. Bottom Navigation Actions ── */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl text-sm font-semibold"
            onClick={() => {
              safeSessionStorage.removeItem("ielts_reading_draft");
              router.push("/reading/test?fresh=true");
            }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl text-sm font-semibold bg-primary"
            onClick={() => router.push("/")}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* ── Unlock / Email Modal for non-logged-in users ── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground">Unlock Your Full IELTS Report</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Save your results, view detailed analysis, and receive a complete PDF report in your email.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                className="w-full h-12 rounded-xl text-sm font-bold bg-primary"
                onClick={() => router.push("/auth/sign-in")}
              >
                Get My Full Report
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
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

export default function ReadingResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReadingResultsContent />
    </Suspense>
  );
}
