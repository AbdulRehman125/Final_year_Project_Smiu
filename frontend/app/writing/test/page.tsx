

 
 
"use client"
 
// app/writing/test/page.tsx — Main Test Screen
 
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  Send,
  AlertTriangle,
  Loader2,
  PenLine,
  Moon,
  Save,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  RefreshCw,
  Hourglass,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WritingArea } from "@/components/writing/writing-area"
import { Task1Prompt } from "@/components/writing/task1-prompt"
import { Task2Prompt } from "@/components/writing/task2-prompt"
import { SubmitDialog } from "@/components/writing/submit-dialog"
import { ErrorModal } from "@/components/writing/error-modal"
import {
  fetchWritingQuestions,
  evaluateWriting,
  type TestType,
  type Task1Question,
  type Task2Question,
} from "@/lib/writing-types"
import {
  withTimeout,
  describeError,
  safeSessionStorage,
  type Banner,
} from "@/lib/writing-network-utils"
 
const TOTAL_SECONDS = 60 * 60
 
// Watchdogs — mirror the speaking module's philosophy: never let a screen
// hang forever on a silently-stuck request.
const LOAD_TIMEOUT_MS = 20000     // fetching Task 1 / Task 2 questions
const SUBMIT_TIMEOUT_MS = 45000   // evaluating the finished test
const AUTOSAVE_DEBOUNCE_MS = 1200
 
// When the countdown hits zero we submit automatically. If that attempt
// fails (e.g. the candidate's wifi drops right at the deadline) we retry a
// few times on our own before finally asking the candidate to tap retry —
// they may not be looking at the screen the instant the timer ends.
const AUTO_SUBMIT_RETRY_DELAYS_MS = [4000, 8000, 15000]
 
function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0")
  const s = (secs % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}
 
function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}
 
// ── Start-failure classification ────────────────────────────────────────────
// When loading the test fails, we show a friendly popup whose wording depends
// on *why* it failed. We inspect the error defensively (status code + message
// text) so it works whatever shape fetchWritingQuestions throws.
type StartErrorKind = "offline" | "connection" | "quota" | "timeout" | "server" | "generic"
 
function getErrProp(err: unknown, key: string): unknown {
  return err && typeof err === "object" ? (err as Record<string, unknown>)[key] : undefined
}
 
function classifyStartError(err: unknown): StartErrorKind {
  // Hard signal: the browser itself reports there's no network.
  if (typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine) {
    return "offline"
  }
 
  // Only trust a *real* numeric HTTP status. (We deliberately do NOT sniff
  // digits out of the message text — that used to mis-flag network failures
  // as "server" errors, e.g. any id containing "500".)
  const statusRaw =
    getErrProp(err, "status") ??
    getErrProp(getErrProp(err, "response"), "status") ??
    getErrProp(err, "statusCode")
  const status =
    typeof statusRaw === "number" && Number.isFinite(statusRaw) ? statusRaw : undefined
 
  const text = `${getErrProp(err, "name") ?? ""} ${getErrProp(err, "message") ?? ""} ${getErrProp(err, "code") ?? ""} ${err ?? ""}`.toLowerCase()
 
  // Quota / rate limit — a real 429, or explicit wording.
  if (
    status === 429 ||
    /\b(quota|rate.?limit|too many requests|limit reached|limit exceeded|exceeded your|insufficient (?:credit|quota|balance))\b/.test(text)
  ) {
    return "quota"
  }
 
  // A real HTTP response came back, but the server failed on its side.
  if (status !== undefined && status >= 500 && status <= 599) return "server"
 
  // We waited too long for any response.
  if (/\b(timed out|timeout)\b/.test(text)) return "timeout"
 
  // "The request never reached a server" — classic fetch/network signatures
  // across browsers, OR simply: no HTTP status came back at all. From the
  // user's point of view this is always a connectivity problem, so we say so
  // plainly instead of blaming our servers.
  if (
    /(failed to fetch|load failed|networkerror|network error|network request failed|fetch failed|unable to connect|could not connect|connection refused|err_internet|err_network|err_connection|err_name_not_resolved|dns)/.test(text) ||
    /\btypeerror\b/.test(text) ||
    status === undefined
  ) {
    return "connection"
  }
 
  return "generic"
}
 
// NOTE: every caught error below is logged with console.warn(), not
// console.error(). Next.js's dev overlay pops up a full-screen "Console
// Error" panel on any console.error() call — even ones we've already
// handled gracefully with our own modal. Since these are all handled
// failures (the user sees a friendly banner), console.warn keeps the log
// for debugging without triggering that intrusive dev-only overlay.
 
export default function WritingTestPage() {
  const router = useRouter()
 
  // Test state
  const [testType, setTestType]       = useState<TestType>("academic")
  const [task1Q, setTask1Q]           = useState<Task1Question | null>(null)
  const [task2Q, setTask2Q]           = useState<Task2Question | null>(null)
  const [loading, setLoading]         = useState(true)
  const [loadBanner, setLoadBanner]   = useState<Banner | null>(null)
  const [startErrorKind, setStartErrorKind] = useState<StartErrorKind | null>(null)
 
  // Writing state
  const [activeTask, setActiveTask]   = useState<1 | 2>(1)
  const [task1Text, setTask1Text]     = useState("")
  const [task2Text, setTask2Text]     = useState("")
  const [focusMode, setFocusMode]     = useState(false)
  const [saveStatus, setSaveStatus]   = useState<"saved" | "saving" | "unsaved">("saved")
 
  // Timer state
  const [timeLeft, setTimeLeft]       = useState(TOTAL_SECONDS)
  const [timerStarted, setTimerStarted] = useState(false)
 
  // Submit state
  const [isSubmitting, setIsSubmitting]         = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submitBanner, setSubmitBanner]         = useState<Banner | null>(null)
  const hasSubmitted = useRef(false)
  const startTimeRef = useRef(Date.now())
  const autoRetryAttempt = useRef(0)
  const autoRetryTimer = useRef<NodeJS.Timeout | null>(null)
 
  // Connectivity — shown as a calm inline banner (not a blocking modal), since
  // unlike a live exam the candidate can keep typing safely while offline;
  // only submission actually needs the connection.
  const [isOnline, setIsOnline] = useState(true)
 
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true)
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])
 
  // ── Warn before an accidental refresh/close so in-progress writing is
  //    never lost by mistake. ──
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!loading && !hasSubmitted.current && (task1Text.trim() || task2Text.trim())) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [loading, task1Text, task2Text])
 
  // ── Restore any autosaved draft for this test type before/while questions load ──
  useEffect(() => {
    const stored = safeSessionStorage.get("ielts_test_type") as TestType | null
    const type = stored || "academic"
    setTestType(type)
 
    const draftRaw = safeSessionStorage.get("ielts_writing_draft")
    if (draftRaw) {
      try {
        const draft = JSON.parse(draftRaw)
        if (draft && draft.testType === type) {
          if (typeof draft.task1Text === "string") setTask1Text(draft.task1Text)
          if (typeof draft.task2Text === "string") setTask2Text(draft.task2Text)
        }
      } catch {
        // Corrupted draft — ignore it rather than blocking the test.
      }
    }
  }, [])
 
  // ── Autosave the candidate's writing locally (debounced) so a refresh or
  //    crash never wipes their work. This never blocks or errors visibly —
  //    worst case is it silently no-ops and the "Saved" pill reflects that. ──
  useEffect(() => {
    if (loading) return
    setSaveStatus("unsaved")
    const t = setTimeout(() => {
      setSaveStatus("saving")
      const ok = safeSessionStorage.set(
        "ielts_writing_draft",
        JSON.stringify({ testType, task1Text, task2Text })
      )
      setSaveStatus(ok ? "saved" : "unsaved")
    }, AUTOSAVE_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [task1Text, task2Text, testType, loading])
 
  // ── Load test type + fetch questions from the backend ──
  const loadQuestions = useCallback(() => {
    setLoading(true)
    setLoadBanner(null)
    setStartErrorKind(null)
 
    const stored = (safeSessionStorage.get("ielts_test_type") as TestType) || "academic"
    setTestType(stored)
 
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setLoading(false)
      setStartErrorKind("offline")
      setLoadBanner({
        kind: "error",
        title: "You're offline",
        message: "You need an internet connection to load your writing questions. Reconnect and try again.",
        action: { label: "Try again", run: () => loadQuestions() },
      })
      return
    }
 
    withTimeout(fetchWritingQuestions(stored), LOAD_TIMEOUT_MS, "Loading questions timed out")
      .then((data) => {
        setTask1Q(data.task1)
        setTask2Q(data.task2)
        setLoading(false)
        setTimerStarted(true)
        startTimeRef.current = Date.now()
      })
      .catch((err) => {
        console.warn("Failed to load writing questions", err)
        const { title, message } = describeError(err, { context: "load" })
        setLoading(false)
        setStartErrorKind(classifyStartError(err))
        setLoadBanner({
          kind: "error",
          title,
          message,
          action: { label: "Try again", run: () => loadQuestions() },
        })
      })
  }, [])
 
  useEffect(() => {
    loadQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
 
  // ── Submit handler — never discards the candidate's answers on failure ──
  const handleSubmit = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (hasSubmitted.current || !task1Q || !task2Q) return
      hasSubmitted.current = true
      setIsSubmitting(true)
      setSubmitBanner(null)
 
      // Offline is common right at the moment the timer runs out — check
      // before spending a request on it, and give a clear, calm message.
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        hasSubmitted.current = false
        return handleSubmitFailure(new Error("offline"), opts)
      }
 
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
 
      try {
        const result = await withTimeout(
          evaluateWriting({
            test_type: testType,
            task1_question: task1Q,
            task2_question: task2Q,
            task1_response: task1Text || "(No response submitted)",
            task2_response: task2Text || "(No response submitted)",
            time_taken_seconds: timeTaken,
          }),
          SUBMIT_TIMEOUT_MS,
          "Evaluation timed out"
        )
 
        // Persist the candidate's raw answers alongside the evaluation. The
        // results screen derives Structure / Vocabulary / Writing-metrics from
        // the response text, and lets the candidate review what they wrote.
        // The autosaved draft is cleared right below, so embedding the text
        // here is the reliable source of truth for those panels. We store the
        // raw text (not the "(No response submitted)" placeholder) so empty
        // submissions correctly read as zero rather than as a fake sentence.
        const resultsPayload = {
          ...result,
          task1_response: task1Text,
          task2_response: task2Text,
        }
        const saved = safeSessionStorage.set("ielts_results", JSON.stringify(resultsPayload))
        // Draft no longer needed once we have a real result.
        try { sessionStorage.removeItem("ielts_writing_draft") } catch { /* noop */ }
 
        if (!saved) {
          setIsSubmitting(false)
          hasSubmitted.current = false
          setSubmitBanner({
            kind: "error",
            title: "Couldn't save your results",
            message:
              "Your test was scored, but we couldn't store the results in this browser (storage may be blocked in private/incognito mode). Please allow site storage and try submitting again.",
            action: { label: "Try again", run: () => handleSubmit() },
          })
          return
        }
 
        try {
          router.push("/writing/results")
        } catch (e) {
          console.warn("Navigation to results failed", e)
          setIsSubmitting(false)
          setSubmitBanner({
            kind: "error",
            title: "Couldn't open your results",
            message: "Your test was scored, but we couldn't open the results page. Please go to /writing/results manually.",
          })
        }
      } catch (err) {
        hasSubmitted.current = false
        handleSubmitFailure(err, opts)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [task1Q, task2Q, task1Text, task2Text, testType, router]
  )
 
  /** Centralised failure path: shows a friendly modal (or auto-retries when triggered by the timer). */
  const handleSubmitFailure = useCallback(
    (err: unknown, opts?: { silent?: boolean }) => {
      console.warn("Submit failed", err)
      const { title, message } = describeError(err, { context: "submit" })
 
      if (opts?.silent && autoRetryAttempt.current < AUTO_SUBMIT_RETRY_DELAYS_MS.length) {
        // Automatic (timer-driven) failure — retry quietly in the background
        // a few times before bothering the candidate with a dialog.
        const delay = AUTO_SUBMIT_RETRY_DELAYS_MS[autoRetryAttempt.current]
        autoRetryAttempt.current += 1
        setSubmitBanner({
          kind: "info",
          title: "Reconnecting…",
          message: "Time is up and we're submitting your test. Retrying automatically in the background — please don't close this tab.",
        })
        autoRetryTimer.current = setTimeout(() => {
          handleSubmit({ silent: true })
        }, delay)
        return
      }
 
      setIsSubmitting(false)
      setSubmitBanner({
        kind: "error",
        title,
        message,
        action: { label: "Try again", run: () => { setSubmitBanner(null); handleSubmit() } },
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSubmit]
  )
 
  useEffect(() => {
    return () => {
      if (autoRetryTimer.current) clearTimeout(autoRetryTimer.current)
    }
  }, [])
 
  // ── Countdown timer ──
  useEffect(() => {
    if (!timerStarted) return
    if (timeLeft <= 0) {
      handleSubmit({ silent: true })
      return
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft, timerStarted, handleSubmit])
 
  const task1Words = countWords(task1Text)
  const task2Words = countWords(task2Text)
  const isWarning  = timeLeft <= 300
  const isCritical = timeLeft <= 60
  const wordLimitsMet = task1Words >= 150 && task2Words >= 250
 
  // ── Loading screen ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-1">Preparing your test...</h2>
          <p className="text-sm text-muted-foreground">
            Our AI is generating fresh IELTS questions for you.
          </p>
        </div>
      </div>
    )
  }
 
  // ── Load-failure — attractive popup (offline / quota / timeout / server) ──
  if (loadBanner || !task1Q || !task2Q) {
    return (
      <div className="min-h-screen bg-background">
        <StartErrorModal
          kind={startErrorKind ?? "generic"}
          fallbackTitle={loadBanner?.title}
          fallbackMessage={loadBanner?.message}
          onRetry={() => loadQuestions()}
          onBack={() => { try { router.push("/writing/select-type") } catch { /* noop */ } }}
        />
      </div>
    )
  }
 
  // ── Evaluating screen ──
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Evaluating your test...</h2>
          <p className="text-muted-foreground">
            Our AI examiner is reviewing your writing against official IELTS band descriptors.
          </p>
          {!isOnline && (
            <p className="text-sm text-red-500 mt-3 flex items-center justify-center gap-1.5">
              <WifiOff className="w-4 h-4" /> Waiting for your internet connection to come back...
            </p>
          )}
        </div>
        <ErrorModal banner={submitBanner} onClose={() => setSubmitBanner(null)} />
      </div>
    )
  }
 
  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-muted/30">
 
      {/* ── Top Bar — 3 cards ── */}
      <header className="shrink-0 px-4 pt-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
 
          {/* Brand + save status */}
          <div className="bg-card border border-border rounded-2xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
              <PenLine className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">IELTS Writing</p>
              <p className={cn(
                "text-xs flex items-center gap-1 leading-tight",
                saveStatus === "saved" ? "text-emerald-500" : saveStatus === "saving" ? "text-muted-foreground" : "text-amber-500"
              )}>
                {saveStatus === "saving" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}
                {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Not saved"}
              </p>
            </div>
            <button
              className="ml-2 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0"
              aria-label="Toggle theme"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
 
          {/* Task Tabs */}
          <div className="flex-1 bg-card border border-border rounded-2xl p-1.5 flex items-center gap-1.5">
            {([1, 2] as const).map((task) => (
              <button
                key={task}
                onClick={() => setActiveTask(task)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                  activeTask === task
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Task {task}
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTask === task ? "bg-primary-foreground/20" : "bg-muted"
                )}>
                  {task === 1 ? task1Words : task2Words}/{task === 1 ? 150 : 250}
                </span>
              </button>
            ))}
          </div>
 
          {/* Timer */}
          <div className={cn(
            "bg-card border rounded-2xl px-5 py-2.5 flex items-center gap-2 font-mono text-lg font-bold justify-center transition-colors",
            isCritical ? "border-red-500/40 text-red-500 animate-pulse"
            : isWarning ? "border-amber-500/40 text-amber-500"
            : "border-border text-foreground"
          )}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
            <span className="hidden sm:inline text-[10px] font-medium text-muted-foreground uppercase tracking-wide ml-1">
              Remaining
            </span>
            {!isOnline && (
              <span className="ml-1 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                <WifiOff className="w-3 h-3" /> OFFLINE
              </span>
            )}
          </div>
        </div>
 
        {/* Warning banners */}
        {isWarning && !isCritical && (
          <div className="max-w-6xl mx-auto mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              5 minutes remaining — both tasks will auto-submit when timer ends.
            </p>
          </div>
        )}
        {isCritical && (
          <div className="max-w-6xl mx-auto mt-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Less than 1 minute! Finish your writing now.
            </p>
          </div>
        )}
        {!isOnline && (
          <div className="max-w-6xl mx-auto mt-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4" />
              You're offline — keep writing, your answers are safe here. Reconnect before submitting.
            </p>
          </div>
        )}
      </header>
 
      {/* ── Main Content ── */}
      <main className="flex-1 lg:min-h-0 px-4 py-3">
        <div className={cn(
          "max-w-6xl mx-auto lg:h-full grid grid-cols-1 gap-4 lg:min-h-0 transition-all",
          focusMode ? "lg:grid-cols-1" : "lg:grid-cols-2"
        )}>
 
          {/* Left — Prompt (independently scrollable on desktop, hidden in Focus mode) */}
          {!focusMode && (
            <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto rounded-2xl">
              {activeTask === 1 ? (
                <Task1Prompt question={task1Q} testType={testType} wordCount={task1Words} />
              ) : (
                <Task2Prompt question={task2Q} wordCount={task2Words} />
              )}
            </div>
          )}
 
          {/* Right — Writing Area (stays fixed in view on desktop) */}
          <div className="lg:h-full lg:min-h-0 flex flex-col">
            <WritingArea
              value={activeTask === 1 ? task1Text : task2Text}
              onChange={(val) => activeTask === 1 ? setTask1Text(val) : setTask2Text(val)}
              minimum={activeTask === 1 ? 150 : 250}
              isFocusMode={focusMode}
              onToggleFocusMode={() => setFocusMode((f) => !f)}
              placeholder={
                activeTask === 1
                  ? "Begin your report here. Start with an introduction that paraphrases the chart description..."
                  : "Begin your essay here. Start with an introduction that paraphrases the topic and states your position..."
              }
            />
          </div>
        </div>
      </main>
 
      {/* ── Bottom Action Bar ── */}
      <footer className="shrink-0 px-4 pb-4">
        <div className="max-w-6xl mx-auto bg-card border border-border rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
 
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            disabled={activeTask === 1}
            onClick={() => setActiveTask(1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Task
          </Button>
 
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                T1 {task1Words}/150
              </span>
              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                T2 {task2Words}/250
              </span>
            </div>
 
            <Button size="sm" className="gap-2" onClick={() => setShowSubmitDialog(true)}>
              <Send className="w-4 h-4" />
              Submit Writing Test
            </Button>
 
            {!wordLimitsMet && (
              <span className="text-xs text-amber-500 font-medium">Word limits not met</span>
            )}
          </div>
 
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-muted-foreground"
            disabled={activeTask === 2}
            onClick={() => setActiveTask(2)}
          >
            Next Task
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
 
      {/* Submit Dialog */}
      <SubmitDialog
        open={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={() => { setShowSubmitDialog(false); handleSubmit() }}
        task1Words={task1Words}
        task2Words={task2Words}
      />
 
      {/* Errors that happen mid-test (submission failures, storage issues) */}
      <ErrorModal banner={submitBanner} onClose={() => setSubmitBanner(null)} />
    </div>
  )
}
 
/* ──────────────────────────────────────────────────────────────────────────
 * Start-failure popup — a friendly, reason-aware modal shown when the test
 * can't be loaded (no internet, test/quota limit reached, timeout, server).
 * ────────────────────────────────────────────────────────────────────────── */
function StartErrorModal({
  kind,
  fallbackTitle,
  fallbackMessage,
  onRetry,
  onBack,
}: {
  kind: StartErrorKind
  fallbackTitle?: string
  fallbackMessage?: string
  onRetry: () => void
  onBack: () => void
}) {
  const config = {
    offline: {
      Icon: WifiOff,
      accent: "text-amber-500",
      chip: "bg-amber-500/10",
      ring: "ring-amber-500/10",
      title: "No internet connection",
      message:
        "You appear to be offline. Please reconnect to the internet and try again — nothing you've done is lost.",
    },
    connection: {
      Icon: WifiOff,
      accent: "text-amber-500",
      chip: "bg-amber-500/10",
      ring: "ring-amber-500/10",
      title: "Can't reach our servers",
      message:
        "We couldn't connect to start your test. Please check your internet connection and try again — nothing is lost.",
    },
    quota: {
      Icon: Hourglass,
      accent: "text-violet-500",
      chip: "bg-violet-500/10",
      ring: "ring-violet-500/10",
      title: "You've reached your test limit",
      message:
        "You've used all the writing tests available on your plan for now. Your limit will reset soon — please try again later.",
    },
    timeout: {
      Icon: Clock,
      accent: "text-sky-500",
      chip: "bg-sky-500/10",
      ring: "ring-sky-500/10",
      title: "This is taking longer than usual",
      message:
        "Our AI took too long to prepare your questions. This is usually temporary — please try again.",
    },
    server: {
      Icon: AlertTriangle,
      accent: "text-red-500",
      chip: "bg-red-500/10",
      ring: "ring-red-500/10",
      title: "Something went wrong on our end",
      message: "Our servers had a problem preparing your test. Please try again in a moment.",
    },
    generic: {
      Icon: AlertTriangle,
      accent: "text-red-500",
      chip: "bg-red-500/10",
      ring: "ring-red-500/10",
      title: fallbackTitle || "Couldn't start your test",
      message: fallbackMessage || "Something went wrong while preparing your test. Please try again.",
    },
  }[kind]
 
  const { Icon } = config
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/40">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="start-error-title"
        aria-describedby="start-error-message"
        className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          onClick={onBack}
          aria-label="Close and go back to test selection"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <X className="w-4 h-4" />
        </button>
 
        <div className={cn("w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ring-8", config.chip, config.ring)}>
          <Icon className={cn("w-7 h-7", config.accent)} />
        </div>
 
        <h2 id="start-error-title" className="text-lg font-bold text-foreground mt-5">
          {config.title}
        </h2>
        <p id="start-error-message" className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {config.message}
        </p>
 
        <div className="flex flex-col gap-2.5 mt-6">
          <Button onClick={onRetry} className="h-11 rounded-xl gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Button variant="ghost" onClick={onBack} className="h-11 rounded-xl text-muted-foreground">
            Back to test selection
          </Button>
        </div>
      </div>
    </div>
  )
}
 