"use client";

// app/listening/test/page.tsx — IELTS Listening Exam Interface

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Headphones, Flag, Send, ChevronLeft, ChevronRight, Loader2, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

import type { ListeningTest, ListeningQuestion, ListeningSection } from "@/lib/listening-types";
import { generateListeningTest, evaluateListeningTest } from "@/lib/listening-types";
import { safeSessionStorage, describeError, withTimeout } from "@/lib/reading-network-utils";
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

        // Check whether AI generation flag is enabled
        const generateWithAI = process.env.NEXT_PUBLIC_GENERATE_LISTENING_WITH_AI === "true";

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
              if (dbTest && dbTest.sections?.length > 0 && dbTest.questions?.length === 40) {
                newTest = dbTest as ListeningTest;
              }
            }
          } catch {
            /* ignore DB fetch error */
          }

          // Fallback to local random test if DB is empty
          if (!newTest) {
            const { FALLBACK_LISTENING_TESTS } = await import("@/lib/listening-fallback-tests");
            const randomIndex = Math.floor(Math.random() * FALLBACK_LISTENING_TESTS.length);
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
              audioUrls: newTest.audioUrls || {},
              transcripts: newTest.transcripts || {},
              topics: newTest.topics,
              totalQuestions: newTest.totalQuestions,
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

  // ── 2. Timer countdown ──
  useEffect(() => {
    if (loading || submitting || !test) return;

    timerIdRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIdRef.current!);
          handleSubmit(true); // Auto-submit when time reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [loading, submitting, test]);

  // ── 3. Autosave draft ──
  useEffect(() => {
    if (!test || loading || submitting) return;

    const timer = setTimeout(() => {
      safeSessionStorage.setItem("ielts_listening_draft", {
        test,
        answers,
        flags: Array.from(flags),
        timeLeft,
      });
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [test, answers, flags, timeLeft, loading, submitting]);

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

  const handleSelectQ = (qNum: number) => {
    setActiveQ(qNum);

    // Switch active section tab if target question belongs to another section
    if (test) {
      const targetSectionIdx = test.questions.find((q) => q.index === qNum)?.sectionIndex;
      if (typeof targetSectionIdx === "number" && targetSectionIdx !== activeSection) {
        setActiveSection(targetSectionIdx);
      }
    }
  };

  const handleNextQ = () => {
    if (activeQ < 40) handleSelectQ(activeQ + 1);
  };

  const handlePrevQ = () => {
    if (activeQ > 1) handleSelectQ(activeQ - 1);
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!test || submitting) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    const timeTaken = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));

    // Convert numeric keys to string keys for API payload
    const strAnswers: Record<string, string> = {};
    Object.entries(answers).forEach(([k, v]) => {
      strAnswers[k] = v;
    });

    try {
      // Evaluate results
      const results = await withTimeout(
        evaluateListeningTest({
          answers: strAnswers,
          timeTakenSeconds: timeTaken,
          test,
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <h2 className="text-xl font-bold text-foreground">Preparing your IELTS Listening Test...</h2>
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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* ── TOP NAVIGATION BAR ── */}
      <header className="px-3 sm:px-6 py-2 sm:py-2.5 border-b border-border bg-card flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-sm overflow-x-auto scrollbar-none">
        {/* Module Title Badge & Theme Toggler */}
        <div className="flex items-center gap-2.5 sm:gap-3 bg-muted/30 px-3 py-2 rounded-2xl border border-border">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-foreground leading-tight">IELTS Listening</h1>
            <div className="w-20 sm:w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(totalAnsweredCount / 40) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              {totalAnsweredCount}/40
            </span>
          </div>

          {/* Theme Toggler Button */}
          <div className="ml-1 pl-2 border-l border-border">
            <AnimatedThemeToggler className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-foreground hover:bg-muted transition-colors" />
          </div>
        </div>

        {/* Section Selector Tabs */}
        <div className="flex-1 min-w-[240px] max-w-xl">
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

        {/* Timer */}
        <ListeningTimer secondsLeft={timeLeft} />
      </header>

      {/* ── MOBILE VIEW TOGGLE (visible only on screens < lg) ── */}
      <div className="lg:hidden flex border-b border-border bg-muted/20 px-4 py-2 gap-2">
        <button
          type="button"
          onClick={() => setMobileView("audio")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
            mobileView === "audio"
              ? "bg-primary text-primary-foreground border-primary shadow"
              : "bg-card text-muted-foreground border-border"
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
              ? "bg-primary text-primary-foreground border-primary shadow"
              : "bg-card text-muted-foreground border-border"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Questions (Q{activeQ})
        </button>
      </div>

      {/* ── MAIN WORKSPACE (SPLIT PANE on lg+, TABBED on mobile) ── */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 p-3 sm:p-4 overflow-hidden">
        {/* Left Pane — Audio Player & Info */}
        <section
          className={`lg:col-span-6 h-full min-h-0 ${
            mobileView === "audio" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-4 h-full overflow-y-auto">
            {/* Section Header */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-foreground">{currentSection.title}</h2>
              <p className="text-sm text-muted-foreground">{currentSection.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/20">
                  {currentSection.difficulty}
                </span>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/20">
                  Speakers: {currentSection.speakers || 2}
                </span>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/20">
                  ~{currentSection.durationMinutes || 7} minutes
                </span>
              </div>
            </div>
            
            {/* Audio Player */}
            <AudioPlayer audioUrl={currentSection.audioUrl || (test.audioUrls && (test.audioUrls[String(activeSection)] || test.audioUrls[activeSection])) || ""} />
            
            {/* Section Instructions */}
            <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4 border border-border">
              <p>Listen carefully to the audio for this section. Answer questions {pStartQ}-{pEndQ} based on what you hear.</p>
            </div>
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
      <footer className="px-3 sm:px-6 py-2.5 sm:py-3 border-t border-border bg-card flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-md">
        <Button
          variant="outline"
          size="sm"
          className="h-9 sm:h-10 rounded-xl px-3 sm:px-4 text-xs sm:text-sm"
          disabled={activeQ <= 1}
          onClick={handlePrevQ}
        >
          <ChevronLeft className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-semibold text-muted-foreground">
            Q{activeQ} of 40
          </span>

          <Button
            variant="outline"
            size="sm"
            className={`h-9 sm:h-10 rounded-xl px-3 sm:px-4 text-xs sm:text-sm ${
              flags.has(activeQ)
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : ""
            }`}
            onClick={() => toggleFlag(activeQ)}
          >
            <Flag className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">{flags.has(activeQ) ? "Flagged" : "Flag"}</span>
          </Button>

          <Button
            className="h-9 sm:h-10 rounded-xl px-4 sm:px-6 text-xs sm:text-sm bg-primary"
            disabled={submitting}
            onClick={() => setShowSubmitModal(true)}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:mr-2" />
            )}
            Submit
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-9 sm:h-10 rounded-xl px-3 sm:px-4 text-xs sm:text-sm"
          disabled={activeQ >= 40}
          onClick={handleNextQ}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 sm:ml-1" />
        </Button>
      </footer>

      {/* Submit confirmation modal */}
      <SubmitDialog
        open={showSubmitModal}
        sections={test.sections}
        answers={answers}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={() => handleSubmit(false)}
      />

      {/* Error banner modal */}
      <ErrorModal banner={banner} onClose={() => setBanner(null)} />
    </div>
  );
}

export default function ListeningTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading listening test...</p>
        </div>
      }
    >
      <ListeningTestContent />
    </Suspense>
  );
}
