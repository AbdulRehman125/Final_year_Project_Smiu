"use client";

// app/listening/test/page.tsx — IELTS Listening Exam Interface

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Headphones,
  Flag,
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  HelpCircle,
  Users,
  Clock,
  BarChart2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

import type {
  ListeningTest,
  ListeningQuestion,
  ListeningSection,
} from "@/lib/listening-types";
import {
  generateListeningTest,
  evaluateListeningTest,
} from "@/lib/listening-types";
import {
  safeSessionStorage,
  describeError,
  withTimeout,
} from "@/lib/reading-network-utils";
import { trpc } from "@/server/client";

import { AudioPlayer } from "@/components/listening/audio-player";
import { QuestionCard } from "@/components/listening/question-card";
import { QuestionGrid } from "@/components/listening/question-grid";
import { SectionTabs } from "@/components/listening/section-tabs";
import { ListeningTimer } from "@/components/listening/listening-timer";
import { SubmitDialog } from "@/components/listening/submit-dialog";
import { ErrorModal } from "@/components/writing/error-modal";

const TOTAL_SECONDS = 1800; // 30 minutes
const AUTOSAVE_DEBOUNCE_MS = 1200;

function ListeningTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFreshRequest = searchParams.get("fresh") === "true";

  // Test state
  const [test, setTest] = useState<ListeningTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<any | null>(null);

  // Mobile view tab ("audio" | "questions")
  const [mobileView, setMobileView] = useState<"audio" | "questions">("audio");

  // Active navigation state
  const [activeSection, setActiveSection] = useState(0);
  const [activeQ, setActiveQ] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);

  // Timer & Modals
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  // tRPC mutations for caching & attempt saving
  const saveTestMutation = trpc.listening.saveTest.useMutation();
  const submitAttemptMutation = trpc.listening.submitAttempt.useMutation();

  // ── 1. Fetch or generate test ──
  useEffect(() => {
    let isMounted = true;

    async function initTest() {
      try {
        // If fresh test requested, clear old draft completely
        if (isFreshRequest) {
          safeSessionStorage.removeItem("ielts_listening_draft");
        }

        // Restore draft if present and not fresh
        const draft = !isFreshRequest
          ? safeSessionStorage.getItem<{
              test: ListeningTest;
              answers: Record<number, string>;
              flags: number[];
              timeLeft: number;
            }>("ielts_listening_draft")
          : null;

        if (draft && draft.test && draft.test.questions?.length === 40) {
          if (isMounted) {
            setTest(draft.test);
            setAnswers(draft.answers || {});
            setFlags(new Set(draft.flags || []));
            setTimeLeft(draft.timeLeft || TOTAL_SECONDS);
            setLoading(false);
          }
          return;
        }

        // Check whether AI generation flag is enabled (dynamically fetched from DB with fallback to env)
        let generateWithAI =
          process.env.NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI === "true";
        try {
          const settingsRes = await fetch("/api/settings/public");
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            if (typeof settingsData.NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI === "boolean") {
              generateWithAI = settingsData.NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI;
            }
          }
        } catch {
          /* fallback to env */
        }

        let newTest: ListeningTest | null = null;

        if (generateWithAI) {
          // Generate new test via AI
          newTest = await withTimeout(
            generateListeningTest(),
            90000,
            "Generating test took longer than expected. Retrying..."
          );
        } else {
          // Fetch random test from Prisma DB
          try {
            const res = await fetch("/api/trpc/listening.getTest");
            if (res.ok) {
              const json = await res.json();
              const dbTest = json?.result?.data;
              if (
                dbTest &&
                dbTest.sections?.length > 0 &&
                dbTest.questions?.length === 40
              ) {
                newTest = dbTest as ListeningTest;
              }
            }
          } catch {
            /* ignore DB fetch error */
          }

          // Fallback to local random test if DB is empty
          if (!newTest) {
            const { FALLBACK_LISTENING_TESTS } = await import(
              "@/lib/listening-fallback-tests"
            );
            const randomIndex = Math.floor(
              Math.random() * FALLBACK_LISTENING_TESTS.length
            );
            newTest = FALLBACK_LISTENING_TESTS[randomIndex];
          }
        }

        if (isMounted && newTest) {
          setTest(newTest);
          setLoading(false);
        }

        // Save to DB in background if generated via AI
        if (generateWithAI && newTest) {
          try {
            saveTestMutation.mutate({
              title: newTest.title,
              difficulty: newTest.difficulty,
              sections: newTest.sections,
              questions: newTest.questions,
              topics: newTest.topics,
              totalQuestions: newTest.totalQuestions,
              audioUrls: newTest.audioUrls,
            });
          } catch {
            /* background save ignore */
          }
        }
      } catch (err) {
        if (isMounted) {
          setBanner(describeError(err, "load"));
          setLoading(false);
        }
      }
    }

    initTest();

    return () => {
      isMounted = false;
    };
  }, [isFreshRequest]);

  // ── 2. Timer Countdown ──
  useEffect(() => {
    if (loading || submitting) return;

    timerIdRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIdRef.current!);
          handleSubmitTest(); // Auto submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [loading, submitting]);

  // ── 3. Auto-save draft to sessionStorage (debounced) ──
  useEffect(() => {
    if (!test || loading) return;

    const timer = setTimeout(() => {
      safeSessionStorage.setItem("ielts_listening_draft", {
        test,
        answers,
        flags: Array.from(flags),
        timeLeft,
      });
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [test, answers, flags, timeLeft, loading]);

  // ── Handlers ──
  const handleAnswer = (qIdx: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: val }));
  };

  const toggleFlag = (qIdx: number) => {
    setFlags((prev) => {
      const next = new Set(prev);
      if (next.has(qIdx)) next.delete(qIdx);
      else next.add(qIdx);
      return next;
    });
  };

  const handleSelectQ = (qIdx: number) => {
    setActiveQ(qIdx);
    // Switch active section if the question belongs to another section
    if (test) {
      const sIdx = test.sections.findIndex((s) => {
        const [start, end] = s.questionRange || [1, 10];
        return qIdx >= start && qIdx <= end;
      });
      if (sIdx !== -1 && sIdx !== activeSection) {
        setActiveSection(sIdx);
      }
    }
  };

  const handlePrevQ = () => {
    if (activeQ > 1) {
      handleSelectQ(activeQ - 1);
    }
  };

  const handleNextQ = () => {
    if (activeQ < 40) {
      handleSelectQ(activeQ + 1);
    }
  };

  // ── 4. Submit & Evaluate Test ──
  const handleSubmitTest = async () => {
    if (!test || submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      const timeTaken = TOTAL_SECONDS - timeLeft;
      const strAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([k, v]) => {
        strAnswers[k] = v;
      });

      // Grade test locally / evaluate with AI recommendations
      const results = await withTimeout(
        evaluateListeningTest({
          test,
          answers: strAnswers,
          userAnswers: strAnswers,
          timeTakenSeconds: timeTaken,
        }),
        30000,
        "Evaluating test results..."
      );

      // Save attempt to DB via tRPC
      try {
        if (test.id) {
          await submitAttemptMutation.mutateAsync({
            testId: test.id,
            answers: strAnswers,
            score: results.score,
            bandScore: results.bandScore,
            accuracy: results.accuracy,
            timeTakenSeconds: timeTaken,
            sectionScores: results.sectionScores,
            questionTypeScores: results.questionTypeScores,
            recommendations: results.recommendations,
          });
        }
      } catch {
        /* ignore DB save failure */
      }

      // Persist results and clear draft completely
      safeSessionStorage.setItem("listening_results", results);
      safeSessionStorage.removeItem("ielts_listening_draft");

      // Replace route so back button doesn't land back in submitted test state
      router.replace("/listening/results");
    } catch (err) {
      setSubmitting(false);
      setBanner(describeError(err, "submit"));
    }
  };

  // ── Render Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfcfd] dark:bg-background flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Preparing your IELTS Listening Test...
        </h2>
      </div>
    );
  }

  if (!test) return null;

  const currentSection: ListeningSection = test.sections[activeSection];
  const currentQ: ListeningQuestion =
    test.questions.find((q) => q.index === activeQ) || test.questions[0];

  const [pStartQ, pEndQ] = currentSection.questionRange || [1, 10];
  const totalAnsweredCount = Object.keys(answers).filter(
    (k) => answers[Number(k)] && answers[Number(k)].trim().length > 0
  ).length;

  return (
    <div className="h-screen bg-[#f8fafc] dark:bg-background flex flex-col overflow-hidden">
      {/* ── TOP FLOATING HEADER (3 Separate Cards) ── */}
      <header className="px-4 sm:px-6 pt-3 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 overflow-x-auto scrollbar-none">
        {/* Left Card: Brand Badge + Progress + Theme Toggler */}
        <div className="flex items-center gap-3 bg-white dark:bg-card px-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-border/60 shadow-sm shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
              IELTS Listening
            </h1>
            <div className="w-20 sm:w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[#0284c7] transition-all duration-300"
                style={{ width: `${(totalAnsweredCount / 40) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
              {totalAnsweredCount}/40
            </span>
          </div>

          {/* Theme Toggler Button */}
          <div className="ml-1 pl-2 border-l border-slate-200 dark:border-slate-800">
            <AnimatedThemeToggler className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-card flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors" />
          </div>
        </div>

        {/* Center Card: Section Tabs */}
        <div className="flex-1 max-w-2xl">
          <SectionTabs
            sections={test.sections}
            activeSection={activeSection}
            answers={answers}
            onSelectSection={(idx) => {
              setActiveSection(idx);
              const [start] = test.sections[idx].questionRange || [1, 10];
              setActiveQ(start);
            }}
          />
        </div>

        {/* Right Card: Timer */}
        <div className="shrink-0">
          <ListeningTimer secondsLeft={timeLeft} />
        </div>
      </header>

      {/* ── MOBILE VIEW TOGGLE (visible only on screens < lg) ── */}
      <div className="lg:hidden flex border-b border-slate-200/80 dark:border-border/60 bg-white dark:bg-card px-4 py-2 gap-2">
        <button
          type="button"
          onClick={() => setMobileView("audio")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
            mobileView === "audio"
              ? "bg-[#0284c7] text-white border-[#0284c7] shadow"
              : "bg-white dark:bg-card text-slate-500 border-slate-200 dark:border-border"
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          Audio & Info
        </button>
        <button
          type="button"
          onClick={() => setMobileView("questions")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
            mobileView === "questions"
              ? "bg-[#0284c7] text-white border-[#0284c7] shadow"
              : "bg-white dark:bg-card text-slate-500 border-slate-200 dark:border-border"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Questions (Q{activeQ})
        </button>
      </div>

      {/* ── MAIN WORKSPACE (SPLIT PANE on lg+, TABBED on mobile) ── */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 sm:px-6 py-2 overflow-hidden">
        {/* Left Pane — Audio Player & Info */}
        <section
          className={`lg:col-span-6 h-full min-h-0 overflow-y-auto space-y-4 ${
            mobileView === "audio" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="space-y-4">
            {/* Section Header Card */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] p-6 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-200">
                  {currentSection.difficulty || "EASY"}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  ~{currentSection.durationMinutes || 7} minutes
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {currentSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {currentSection.description}
              </p>
            </div>

            {/* Audio Waveform Player */}
            <AudioPlayer
              audioUrl={
                currentSection.audioUrl ||
                (test.audioUrls &&
                  (test.audioUrls[String(activeSection)] ||
                    test.audioUrls[activeSection])) ||
                ""
              }
            />

            {/* Section Meta Pills: Speakers, Duration, Difficulty */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 text-sky-500 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    SPEAKERS
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {currentSection.speakers || "Two speakers"}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 text-sky-500 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    DURATION
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {currentSection.durationMinutes || "7"}:00
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 text-sky-500 flex items-center justify-center shrink-0">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    DIFFICULTY
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate capitalize block">
                    {currentSection.difficulty || "Easy"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section Instructions Card */}
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm text-xs text-slate-600 dark:text-slate-300">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                  INSTRUCTIONS
                </span>
                <p className="leading-relaxed">
                  You will hear a conversation between speakers. Listen carefully
                  and answer questions {pStartQ}–{pEndQ}.
                </p>
              </div>
            </div>

            {/* Collapsible Transcript for Practice */}
            {currentSection.transcript && (
              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Headphones className="w-3.5 h-3.5 text-sky-500" />
                    Show Transcript
                    <span className="px-2 py-0.5 rounded text-[9px] bg-amber-50 text-amber-600 border border-amber-200 uppercase font-black">
                      Practice Mode
                    </span>
                  </span>
                  {showTranscript ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {showTranscript && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 max-h-48 overflow-y-auto">
                    {currentSection.transcript}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Pane — Question Sheet & Grid */}
        <section
          className={`lg:col-span-6 h-full flex flex-col min-h-0 space-y-4 overflow-y-auto ${
            mobileView === "questions" ? "block" : "hidden lg:flex"
          }`}
        >
          {/* Question Grid */}
          <QuestionGrid
            startQ={pStartQ}
            endQ={pEndQ}
            activeQ={activeQ}
            answers={answers}
            flags={flags}
            onSelectQ={handleSelectQ}
          />

          {/* Active Question Card */}
          <div className="flex-1 min-h-0">
            <QuestionCard
              question={currentQ}
              userAnswer={answers[activeQ] || ""}
              onChangeAnswer={(ans) => handleAnswer(activeQ, ans)}
            />
          </div>
        </section>
      </main>

      {/* ── BOTTOM ACTION BAR ── */}
      <footer className="px-4 sm:px-6 py-2.5 border-t border-slate-200/80 dark:border-border/60 bg-white dark:bg-card flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-sm">
        <Button
          variant="outline"
          size="sm"
          className="h-9 sm:h-10 rounded-full px-4 sm:px-5 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
          disabled={activeQ <= 1}
          onClick={handlePrevQ}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            Q{activeQ} of 40
          </span>

          <Button
            variant="outline"
            size="sm"
            className={`h-9 rounded-full px-4 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 ${
              flags.has(activeQ)
                ? "bg-amber-50 border-amber-300 text-amber-600 dark:text-amber-400"
                : ""
            }`}
            onClick={() => toggleFlag(activeQ)}
          >
            <Flag className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>{flags.has(activeQ) ? "Flagged" : "Flag"}</span>
          </Button>

          <Button
            size="sm"
            className="h-9 rounded-full px-6 text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[0_3px_12px_rgba(2,132,199,0.3)] transition-all"
            disabled={submitting}
            onClick={() => setShowSubmitModal(true)}
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Send className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span>Submit</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 sm:h-10 rounded-full px-4 sm:px-5 text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
          disabled={activeQ >= 40}
          onClick={handleNextQ}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </footer>

      {/* ── Submit Confirmation Dialog ── */}
      <SubmitDialog
        open={showSubmitModal}
        sections={test.sections}
        answers={answers}
        totalAnswered={totalAnsweredCount}
        totalQuestions={40}
        flaggedCount={flags.size}
        timeLeft={timeLeft}
        isSubmitting={submitting}
        onCancel={() => setShowSubmitModal(false)}
        onConfirm={handleSubmitTest}
      />

      {/* ── Error Banner Modal ── */}
      {banner && (
        <ErrorModal
          isOpen={true}
          title={banner.title}
          message={banner.message}
          actionLabel={banner.actionLabel}
          onAction={() => {
            setBanner(null);
            if (banner.actionLabel === "Retry Generation") {
              window.location.reload();
            }
          }}
          onClose={() => setBanner(null)}
        />
      )}
    </div>
  );
}

export default function ListeningTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbfcfd] dark:bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ListeningTestContent />
    </Suspense>
  );
}
