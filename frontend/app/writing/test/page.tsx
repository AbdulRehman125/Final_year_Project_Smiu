

// "use client"

// // app/writing/test/page.tsx — Main Test Screen

// import { useState, useEffect, useRef, useCallback } from "react"
// import { useRouter } from "next/navigation"
// import {
//   Clock,
//   Send,
//   AlertTriangle,
//   Loader2,
//   PenLine,
//   Moon,
//   Save,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { WritingArea } from "@/components/writing/writing-area"
// import { Task1Prompt } from "@/components/writing/task1-prompt"
// import { Task2Prompt } from "@/components/writing/task2-prompt"
// import { SubmitDialog } from "@/components/writing/submit-dialog"
// import {
//   fetchWritingQuestions,
//   evaluateWriting,
//   type TestType,
//   type Task1Question,
//   type Task2Question,
// } from "@/lib/writing-types"

// const TOTAL_SECONDS = 60 * 60

// function formatTime(secs: number) {
//   const m = Math.floor(secs / 60).toString().padStart(2, "0")
//   const s = (secs % 60).toString().padStart(2, "0")
//   return `${m}:${s}`
// }

// function countWords(text: string) {
//   return text.trim() ? text.trim().split(/\s+/).length : 0
// }

// export default function WritingTestPage() {
//   const router = useRouter()

//   // Test state
//   const [testType, setTestType]       = useState<TestType>("academic")
//   const [task1Q, setTask1Q]           = useState<Task1Question | null>(null)
//   const [task2Q, setTask2Q]           = useState<Task2Question | null>(null)
//   const [loading, setLoading]         = useState(true)
//   const [loadError, setLoadError]     = useState(false)

//   // Writing state
//   const [activeTask, setActiveTask]   = useState<1 | 2>(1)
//   const [task1Text, setTask1Text]     = useState("")
//   const [task2Text, setTask2Text]     = useState("")
//   const [focusMode, setFocusMode]     = useState(false)

//   // Timer state
//   const [timeLeft, setTimeLeft]       = useState(TOTAL_SECONDS)
//   const [timerStarted, setTimerStarted] = useState(false)

//   // Submit state
//   const [isSubmitting, setIsSubmitting]       = useState(false)
//   const [showSubmitDialog, setShowSubmitDialog] = useState(false)
//   const hasSubmitted = useRef(false)
//   const startTimeRef = useRef(Date.now())

//   // ── Load test type + fetch questions from LLM ──
//   useEffect(() => {
//     const stored = sessionStorage.getItem("ielts_test_type") as TestType
//     const type = stored || "academic"
//     setTestType(type)

//     fetchWritingQuestions(type)
//       .then((data) => {
//         setTask1Q(data.task1)
//         setTask2Q(data.task2)
//         setLoading(false)
//         setTimerStarted(true)
//         startTimeRef.current = Date.now()
//       })
//       .catch(() => {
//         setLoadError(true)
//         setLoading(false)
//       })
//   }, [])

//   // ── Submit handler ──
//   const handleSubmit = useCallback(async () => {
//     if (hasSubmitted.current || !task1Q || !task2Q) return
//     hasSubmitted.current = true
//     setIsSubmitting(true)

//     const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)

//     try {
//       const result = await evaluateWriting({
//         test_type: testType,
//         task1_question: task1Q,
//         task2_question: task2Q,
//         task1_response: task1Text || "(No response submitted)",
//         task2_response: task2Text || "(No response submitted)",
//         time_taken_seconds: timeTaken,
//       })
//       sessionStorage.setItem("ielts_results", JSON.stringify(result))
//       router.push("/writing/results")
//     } catch {
//       setIsSubmitting(false)
//       hasSubmitted.current = false
//     }
//   }, [task1Text, task2Text, testType, task1Q, task2Q, router])

//   // ── Countdown timer ──
//   useEffect(() => {
//     if (!timerStarted) return
//     if (timeLeft <= 0) { handleSubmit(); return }
//     const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
//     return () => clearInterval(id)
//   }, [timeLeft, timerStarted, handleSubmit])

//   const task1Words = countWords(task1Text)
//   const task2Words = countWords(task2Text)
//   const isWarning  = timeLeft <= 300
//   const isCritical = timeLeft <= 60
//   const wordLimitsMet = task1Words >= 150 && task2Words >= 250

//   // ── Loading screen ──
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
//         <Loader2 className="w-10 h-10 text-primary animate-spin" />
//         <div className="text-center">
//           <h2 className="text-xl font-semibold text-foreground mb-1">Preparing your test...</h2>
//           <p className="text-sm text-muted-foreground">
//             Our AI is generating fresh IELTS questions for you.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   // ── Error screen ──
//   if (loadError || !task1Q || !task2Q) {
//     return (
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
//         <p className="text-foreground font-semibold">Failed to load questions.</p>
//         <Button onClick={() => { setLoadError(false); setLoading(true); window.location.reload() }}>
//           Try Again
//         </Button>
//       </div>
//     )
//   }

//   // ── Evaluating screen ──
//   if (isSubmitting) {
//     return (
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
//         <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-foreground mb-2">Evaluating your test...</h2>
//           <p className="text-muted-foreground">
//             Our AI examiner is reviewing your writing against official IELTS band descriptors.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-muted/30">

//       {/* ── Top Bar — 3 cards ── */}
//       <header className="shrink-0 px-4 pt-4">
//         <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

//           {/* Brand + save status */}
//           <div className="bg-card border border-border rounded-2xl px-4 py-2.5 flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
//               <PenLine className="w-4 h-4" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-foreground leading-tight">IELTS Writing</p>
//               <p className="text-xs text-emerald-500 flex items-center gap-1 leading-tight">
//                 <Save className="w-3 h-3" /> Saved
//               </p>
//             </div>
//             <button
//               className="ml-2 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0"
//               aria-label="Toggle theme"
//             >
//               <Moon className="w-4 h-4" />
//             </button>
//           </div>

//           {/* Task Tabs */}
//           <div className="flex-1 bg-card border border-border rounded-2xl p-1.5 flex items-center gap-1.5">
//             {([1, 2] as const).map((task) => (
//               <button
//                 key={task}
//                 onClick={() => setActiveTask(task)}
//                 className={cn(
//                   "flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
//                   activeTask === task
//                     ? "bg-primary text-primary-foreground shadow-sm"
//                     : "text-muted-foreground hover:text-foreground hover:bg-muted"
//                 )}
//               >
//                 Task {task}
//                 <span className={cn(
//                   "text-xs px-1.5 py-0.5 rounded-full",
//                   activeTask === task ? "bg-primary-foreground/20" : "bg-muted"
//                 )}>
//                   {task === 1 ? task1Words : task2Words}/{task === 1 ? 150 : 250}
//                 </span>
//               </button>
//             ))}
//           </div>

//           {/* Timer */}
//           <div className={cn(
//             "bg-card border rounded-2xl px-5 py-2.5 flex items-center gap-2 font-mono text-lg font-bold justify-center transition-colors",
//             isCritical ? "border-red-500/40 text-red-500 animate-pulse"
//             : isWarning ? "border-amber-500/40 text-amber-500"
//             : "border-border text-foreground"
//           )}>
//             <Clock className="w-4 h-4" />
//             {formatTime(timeLeft)}
//             <span className="hidden sm:inline text-[10px] font-medium text-muted-foreground uppercase tracking-wide ml-1">
//               Remaining
//             </span>
//           </div>
//         </div>

//         {/* Warning banners */}
//         {isWarning && !isCritical && (
//           <div className="max-w-6xl mx-auto mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
//             <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
//               <AlertTriangle className="w-4 h-4" />
//               5 minutes remaining — both tasks will auto-submit when timer ends.
//             </p>
//           </div>
//         )}
//         {isCritical && (
//           <div className="max-w-6xl mx-auto mt-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
//             <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
//               <AlertTriangle className="w-4 h-4" />
//               Less than 1 minute! Finish your writing now.
//             </p>
//           </div>
//         )}
//       </header>

//       {/* ── Main Content ── */}
//       <main className="flex-1 lg:min-h-0 px-4 py-3">
//         <div className={cn(
//           "max-w-6xl mx-auto lg:h-full grid grid-cols-1 gap-4 lg:min-h-0 transition-all",
//           focusMode ? "lg:grid-cols-1" : "lg:grid-cols-2"
//         )}>

//           {/* Left — Prompt (independently scrollable on desktop, hidden in Focus mode) */}
//           {!focusMode && (
//             <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto rounded-2xl">
//               {activeTask === 1 ? (
//                 <Task1Prompt question={task1Q} testType={testType} wordCount={task1Words} />
//               ) : (
//                 <Task2Prompt question={task2Q} wordCount={task2Words} />
//               )}
//             </div>
//           )}

//           {/* Right — Writing Area (stays fixed in view on desktop) */}
//           <div className="lg:h-full lg:min-h-0 flex flex-col">
//             <WritingArea
//               value={activeTask === 1 ? task1Text : task2Text}
//               onChange={(val) => activeTask === 1 ? setTask1Text(val) : setTask2Text(val)}
//               minimum={activeTask === 1 ? 150 : 250}
//               isFocusMode={focusMode}
//               onToggleFocusMode={() => setFocusMode((f) => !f)}
//               placeholder={
//                 activeTask === 1
//                   ? "Begin your report here. Start with an introduction that paraphrases the chart description..."
//                   : "Begin your essay here. Start with an introduction that paraphrases the topic and states your position..."
//               }
//             />
//           </div>
//         </div>
//       </main>

//       {/* ── Bottom Action Bar ── */}
//       <footer className="shrink-0 px-4 pb-4">
//         <div className="max-w-6xl mx-auto bg-card border border-border rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">

//           <Button
//             variant="ghost"
//             size="sm"
//             className="gap-1 text-muted-foreground"
//             disabled={activeTask === 1}
//             onClick={() => setActiveTask(1)}
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Previous Task
//           </Button>

//           <div className="flex items-center gap-4 flex-wrap justify-center">
//             <div className="flex items-center gap-2 text-xs">
//               <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
//                 T1 {task1Words}/150
//               </span>
//               <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
//                 T2 {task2Words}/250
//               </span>
//             </div>

//             <Button size="sm" className="gap-2" onClick={() => setShowSubmitDialog(true)}>
//               <Send className="w-4 h-4" />
//               Submit Writing Test
//             </Button>

//             {!wordLimitsMet && (
//               <span className="text-xs text-amber-500 font-medium">Word limits not met</span>
//             )}
//           </div>

//           <Button
//             variant="ghost"
//             size="sm"
//             className="gap-1 text-muted-foreground"
//             disabled={activeTask === 2}
//             onClick={() => setActiveTask(2)}
//           >
//             Next Task
//             <ChevronRight className="w-4 h-4" />
//           </Button>
//         </div>
//       </footer>

//       {/* Submit Dialog */}
//       <SubmitDialog
//         open={showSubmitDialog}
//         onClose={() => setShowSubmitDialog(false)}
//         onConfirm={() => { setShowSubmitDialog(false); handleSubmit() }}
//         task1Words={task1Words}
//         task2Words={task2Words}
//       />
//     </div>
//   )
// }

































// "use client"

// // app/writing/test/page.tsx — Main Test Screen

// import { useState, useEffect, useRef, useCallback } from "react"
// import { useRouter } from "next/navigation"
// import {
//   Clock,
//   Send,
//   AlertTriangle,
//   Loader2,
//   PenLine,
//   Moon,
//   Save,
//   ChevronLeft,
//   ChevronRight,
//   WifiOff,
//   RefreshCw,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { WritingArea } from "@/components/writing/writing-area"
// import { Task1Prompt } from "@/components/writing/task1-prompt"
// import { Task2Prompt } from "@/components/writing/task2-prompt"
// import { SubmitDialog } from "@/components/writing/submit-dialog"
// import { ErrorModal } from "@/components/writing/error-modal"
// import {
//   fetchWritingQuestions,
//   evaluateWriting,
//   type TestType,
//   type Task1Question,
//   type Task2Question,
// } from "@/lib/writing-types"
// import {
//   withTimeout,
//   describeError,
//   safeSessionStorage,
//   type Banner,
// } from "@/lib/writing-network-utils"

// const TOTAL_SECONDS = 60 * 60

// // Watchdogs — mirror the speaking module's philosophy: never let a screen
// // hang forever on a silently-stuck request.
// const LOAD_TIMEOUT_MS = 20000     // fetching Task 1 / Task 2 questions
// const SUBMIT_TIMEOUT_MS = 45000   // evaluating the finished test
// const AUTOSAVE_DEBOUNCE_MS = 1200

// // When the countdown hits zero we submit automatically. If that attempt
// // fails (e.g. the candidate's wifi drops right at the deadline) we retry a
// // few times on our own before finally asking the candidate to tap retry —
// // they may not be looking at the screen the instant the timer ends.
// const AUTO_SUBMIT_RETRY_DELAYS_MS = [4000, 8000, 15000]

// function formatTime(secs: number) {
//   const m = Math.floor(secs / 60).toString().padStart(2, "0")
//   const s = (secs % 60).toString().padStart(2, "0")
//   return `${m}:${s}`
// }

// function countWords(text: string) {
//   return text.trim() ? text.trim().split(/\s+/).length : 0
// }

// export default function WritingTestPage() {
//   const router = useRouter()

//   // Test state
//   const [testType, setTestType]       = useState<TestType>("academic")
//   const [task1Q, setTask1Q]           = useState<Task1Question | null>(null)
//   const [task2Q, setTask2Q]           = useState<Task2Question | null>(null)
//   const [loading, setLoading]         = useState(true)
//   const [loadBanner, setLoadBanner]   = useState<Banner | null>(null)

//   // Writing state
//   const [activeTask, setActiveTask]   = useState<1 | 2>(1)
//   const [task1Text, setTask1Text]     = useState("")
//   const [task2Text, setTask2Text]     = useState("")
//   const [focusMode, setFocusMode]     = useState(false)
//   const [saveStatus, setSaveStatus]   = useState<"saved" | "saving" | "unsaved">("saved")

//   // Timer state
//   const [timeLeft, setTimeLeft]       = useState(TOTAL_SECONDS)
//   const [timerStarted, setTimerStarted] = useState(false)

//   // Submit state
//   const [isSubmitting, setIsSubmitting]         = useState(false)
//   const [showSubmitDialog, setShowSubmitDialog] = useState(false)
//   const [submitBanner, setSubmitBanner]         = useState<Banner | null>(null)
//   const hasSubmitted = useRef(false)
//   const startTimeRef = useRef(Date.now())
//   const autoRetryAttempt = useRef(0)
//   const autoRetryTimer = useRef<NodeJS.Timeout | null>(null)

//   // Connectivity — shown as a calm inline banner (not a blocking modal), since
//   // unlike a live exam the candidate can keep typing safely while offline;
//   // only submission actually needs the connection.
//   const [isOnline, setIsOnline] = useState(true)

//   useEffect(() => {
//     setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true)
//     const goOnline = () => setIsOnline(true)
//     const goOffline = () => setIsOnline(false)
//     window.addEventListener("online", goOnline)
//     window.addEventListener("offline", goOffline)
//     return () => {
//       window.removeEventListener("online", goOnline)
//       window.removeEventListener("offline", goOffline)
//     }
//   }, [])

//   // ── Warn before an accidental refresh/close so in-progress writing is
//   //    never lost by mistake. ──
//   useEffect(() => {
//     const handler = (e: BeforeUnloadEvent) => {
//       if (!loading && !hasSubmitted.current && (task1Text.trim() || task2Text.trim())) {
//         e.preventDefault()
//         e.returnValue = ""
//       }
//     }
//     window.addEventListener("beforeunload", handler)
//     return () => window.removeEventListener("beforeunload", handler)
//   }, [loading, task1Text, task2Text])

//   // ── Restore any autosaved draft for this test type before/while questions load ──
//   useEffect(() => {
//     const stored = safeSessionStorage.get("ielts_test_type") as TestType | null
//     const type = stored || "academic"
//     setTestType(type)

//     const draftRaw = safeSessionStorage.get("ielts_writing_draft")
//     if (draftRaw) {
//       try {
//         const draft = JSON.parse(draftRaw)
//         if (draft && draft.testType === type) {
//           if (typeof draft.task1Text === "string") setTask1Text(draft.task1Text)
//           if (typeof draft.task2Text === "string") setTask2Text(draft.task2Text)
//         }
//       } catch {
//         // Corrupted draft — ignore it rather than blocking the test.
//       }
//     }
//   }, [])

//   // ── Autosave the candidate's writing locally (debounced) so a refresh or
//   //    crash never wipes their work. This never blocks or errors visibly —
//   //    worst case is it silently no-ops and the "Saved" pill reflects that. ──
//   useEffect(() => {
//     if (loading) return
//     setSaveStatus("unsaved")
//     const t = setTimeout(() => {
//       setSaveStatus("saving")
//       const ok = safeSessionStorage.set(
//         "ielts_writing_draft",
//         JSON.stringify({ testType, task1Text, task2Text })
//       )
//       setSaveStatus(ok ? "saved" : "unsaved")
//     }, AUTOSAVE_DEBOUNCE_MS)
//     return () => clearTimeout(t)
//   }, [task1Text, task2Text, testType, loading])

//   // ── Load test type + fetch questions from the backend ──
//   const loadQuestions = useCallback(() => {
//     setLoading(true)
//     setLoadBanner(null)

//     const stored = (safeSessionStorage.get("ielts_test_type") as TestType) || "academic"
//     setTestType(stored)

//     if (typeof navigator !== "undefined" && !navigator.onLine) {
//       setLoading(false)
//       setLoadBanner({
//         kind: "error",
//         title: "You're offline",
//         message: "You need an internet connection to load your writing questions. Reconnect and try again.",
//         action: { label: "Try again", run: () => loadQuestions() },
//       })
//       return
//     }

//     withTimeout(fetchWritingQuestions(stored), LOAD_TIMEOUT_MS, "Loading questions timed out")
//       .then((data) => {
//         setTask1Q(data.task1)
//         setTask2Q(data.task2)
//         setLoading(false)
//         setTimerStarted(true)
//         startTimeRef.current = Date.now()
//       })
//       .catch((err) => {
//         console.error("Failed to load writing questions", err)
//         const { title, message } = describeError(err, { context: "load" })
//         setLoading(false)
//         setLoadBanner({
//           kind: "error",
//           title,
//           message,
//           action: { label: "Try again", run: () => loadQuestions() },
//         })
//       })
//   }, [])

//   useEffect(() => {
//     loadQuestions()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   // ── Submit handler — never discards the candidate's answers on failure ──
//   const handleSubmit = useCallback(
//     async (opts?: { silent?: boolean }) => {
//       if (hasSubmitted.current || !task1Q || !task2Q) return
//       hasSubmitted.current = true
//       setIsSubmitting(true)
//       setSubmitBanner(null)

//       // Offline is common right at the moment the timer runs out — check
//       // before spending a request on it, and give a clear, calm message.
//       if (typeof navigator !== "undefined" && !navigator.onLine) {
//         hasSubmitted.current = false
//         return handleSubmitFailure(new Error("offline"), opts)
//       }

//       const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)

//       try {
//         const result = await withTimeout(
//           evaluateWriting({
//             test_type: testType,
//             task1_question: task1Q,
//             task2_question: task2Q,
//             task1_response: task1Text || "(No response submitted)",
//             task2_response: task2Text || "(No response submitted)",
//             time_taken_seconds: timeTaken,
//           }),
//           SUBMIT_TIMEOUT_MS,
//           "Evaluation timed out"
//         )

//         const saved = safeSessionStorage.set("ielts_results", JSON.stringify(result))
//         // Draft no longer needed once we have a real result.
//         try { sessionStorage.removeItem("ielts_writing_draft") } catch { /* noop */ }

//         if (!saved) {
//           setIsSubmitting(false)
//           hasSubmitted.current = false
//           setSubmitBanner({
//             kind: "error",
//             title: "Couldn't save your results",
//             message:
//               "Your test was scored, but we couldn't store the results in this browser (storage may be blocked in private/incognito mode). Please allow site storage and try submitting again.",
//             action: { label: "Try again", run: () => handleSubmit() },
//           })
//           return
//         }

//         try {
//           router.push("/writing/results")
//         } catch (e) {
//           console.error("Navigation to results failed", e)
//           setIsSubmitting(false)
//           setSubmitBanner({
//             kind: "error",
//             title: "Couldn't open your results",
//             message: "Your test was scored, but we couldn't open the results page. Please go to /writing/results manually.",
//           })
//         }
//       } catch (err) {
//         hasSubmitted.current = false
//         handleSubmitFailure(err, opts)
//       }
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     },
//     [task1Q, task2Q, task1Text, task2Text, testType, router]
//   )

//   /** Centralised failure path: shows a friendly modal (or auto-retries when triggered by the timer). */
//   const handleSubmitFailure = useCallback(
//     (err: unknown, opts?: { silent?: boolean }) => {
//       console.error("Submit failed", err)
//       const { title, message } = describeError(err, { context: "submit" })

//       if (opts?.silent && autoRetryAttempt.current < AUTO_SUBMIT_RETRY_DELAYS_MS.length) {
//         // Automatic (timer-driven) failure — retry quietly in the background
//         // a few times before bothering the candidate with a dialog.
//         const delay = AUTO_SUBMIT_RETRY_DELAYS_MS[autoRetryAttempt.current]
//         autoRetryAttempt.current += 1
//         setSubmitBanner({
//           kind: "info",
//           title: "Reconnecting…",
//           message: "Time is up and we're submitting your test. Retrying automatically in the background — please don't close this tab.",
//         })
//         autoRetryTimer.current = setTimeout(() => {
//           handleSubmit({ silent: true })
//         }, delay)
//         return
//       }

//       setIsSubmitting(false)
//       setSubmitBanner({
//         kind: "error",
//         title,
//         message,
//         action: { label: "Try again", run: () => { setSubmitBanner(null); handleSubmit() } },
//       })
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [handleSubmit]
//   )

//   useEffect(() => {
//     return () => {
//       if (autoRetryTimer.current) clearTimeout(autoRetryTimer.current)
//     }
//   }, [])

//   // ── Countdown timer ──
//   useEffect(() => {
//     if (!timerStarted) return
//     if (timeLeft <= 0) {
//       handleSubmit({ silent: true })
//       return
//     }
//     const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
//     return () => clearInterval(id)
//   }, [timeLeft, timerStarted, handleSubmit])

//   const task1Words = countWords(task1Text)
//   const task2Words = countWords(task2Text)
//   const isWarning  = timeLeft <= 300
//   const isCritical = timeLeft <= 60
//   const wordLimitsMet = task1Words >= 150 && task2Words >= 250

//   // ── Loading screen ──
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
//         <Loader2 className="w-10 h-10 text-primary animate-spin" />
//         <div className="text-center">
//           <h2 className="text-xl font-semibold text-foreground mb-1">Preparing your test...</h2>
//           <p className="text-sm text-muted-foreground">
//             Our AI is generating fresh IELTS questions for you.
//           </p>
//         </div>
//       </div>
//     )
//   }

//   // ── Load-failure screen (full screen — nothing has been written yet) ──
//   if (loadBanner || !task1Q || !task2Q) {
//     return (
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
//         <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
//           <AlertTriangle className="w-6 h-6 text-red-500" />
//         </div>
//         <p className="text-foreground font-semibold">
//           {loadBanner?.title || "Failed to load questions"}
//         </p>
//         <p className="text-sm text-muted-foreground max-w-sm">
//           {loadBanner?.message || "Something went wrong while preparing your test."}
//         </p>
//         <Button onClick={() => loadQuestions()} className="gap-2">
//           <RefreshCw className="w-4 h-4" />
//           Try Again
//         </Button>
//       </div>
//     )
//   }

//   // ── Evaluating screen ──
//   if (isSubmitting) {
//     return (
//       <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
//         <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-foreground mb-2">Evaluating your test...</h2>
//           <p className="text-muted-foreground">
//             Our AI examiner is reviewing your writing against official IELTS band descriptors.
//           </p>
//           {!isOnline && (
//             <p className="text-sm text-red-500 mt-3 flex items-center justify-center gap-1.5">
//               <WifiOff className="w-4 h-4" /> Waiting for your internet connection to come back...
//             </p>
//           )}
//         </div>
//         <ErrorModal banner={submitBanner} onClose={() => setSubmitBanner(null)} />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-muted/30">

//       {/* ── Top Bar — 3 cards ── */}
//       <header className="shrink-0 px-4 pt-4">
//         <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

//           {/* Brand + save status */}
//           <div className="bg-card border border-border rounded-2xl px-4 py-2.5 flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
//               <PenLine className="w-4 h-4" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-foreground leading-tight">IELTS Writing</p>
//               <p className={cn(
//                 "text-xs flex items-center gap-1 leading-tight",
//                 saveStatus === "saved" ? "text-emerald-500" : saveStatus === "saving" ? "text-muted-foreground" : "text-amber-500"
//               )}>
//                 {saveStatus === "saving" ? (
//                   <Loader2 className="w-3 h-3 animate-spin" />
//                 ) : (
//                   <Save className="w-3 h-3" />
//                 )}
//                 {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Not saved"}
//               </p>
//             </div>
//             <button
//               className="ml-2 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0"
//               aria-label="Toggle theme"
//             >
//               <Moon className="w-4 h-4" />
//             </button>
//           </div>

//           {/* Task Tabs */}
//           <div className="flex-1 bg-card border border-border rounded-2xl p-1.5 flex items-center gap-1.5">
//             {([1, 2] as const).map((task) => (
//               <button
//                 key={task}
//                 onClick={() => setActiveTask(task)}
//                 className={cn(
//                   "flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
//                   activeTask === task
//                     ? "bg-primary text-primary-foreground shadow-sm"
//                     : "text-muted-foreground hover:text-foreground hover:bg-muted"
//                 )}
//               >
//                 Task {task}
//                 <span className={cn(
//                   "text-xs px-1.5 py-0.5 rounded-full",
//                   activeTask === task ? "bg-primary-foreground/20" : "bg-muted"
//                 )}>
//                   {task === 1 ? task1Words : task2Words}/{task === 1 ? 150 : 250}
//                 </span>
//               </button>
//             ))}
//           </div>

//           {/* Timer */}
//           <div className={cn(
//             "bg-card border rounded-2xl px-5 py-2.5 flex items-center gap-2 font-mono text-lg font-bold justify-center transition-colors",
//             isCritical ? "border-red-500/40 text-red-500 animate-pulse"
//             : isWarning ? "border-amber-500/40 text-amber-500"
//             : "border-border text-foreground"
//           )}>
//             <Clock className="w-4 h-4" />
//             {formatTime(timeLeft)}
//             <span className="hidden sm:inline text-[10px] font-medium text-muted-foreground uppercase tracking-wide ml-1">
//               Remaining
//             </span>
//             {!isOnline && (
//               <span className="ml-1 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
//                 <WifiOff className="w-3 h-3" /> OFFLINE
//               </span>
//             )}
//           </div>
//         </div>

//         {/* Warning banners */}
//         {isWarning && !isCritical && (
//           <div className="max-w-6xl mx-auto mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
//             <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
//               <AlertTriangle className="w-4 h-4" />
//               5 minutes remaining — both tasks will auto-submit when timer ends.
//             </p>
//           </div>
//         )}
//         {isCritical && (
//           <div className="max-w-6xl mx-auto mt-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
//             <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
//               <AlertTriangle className="w-4 h-4" />
//               Less than 1 minute! Finish your writing now.
//             </p>
//           </div>
//         )}
//         {!isOnline && (
//           <div className="max-w-6xl mx-auto mt-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
//             <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
//               <WifiOff className="w-4 h-4" />
//               You're offline — keep writing, your answers are safe here. Reconnect before submitting.
//             </p>
//           </div>
//         )}
//       </header>

//       {/* ── Main Content ── */}
//       <main className="flex-1 lg:min-h-0 px-4 py-3">
//         <div className={cn(
//           "max-w-6xl mx-auto lg:h-full grid grid-cols-1 gap-4 lg:min-h-0 transition-all",
//           focusMode ? "lg:grid-cols-1" : "lg:grid-cols-2"
//         )}>

//           {/* Left — Prompt (independently scrollable on desktop, hidden in Focus mode) */}
//           {!focusMode && (
//             <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto rounded-2xl">
//               {activeTask === 1 ? (
//                 <Task1Prompt question={task1Q} testType={testType} wordCount={task1Words} />
//               ) : (
//                 <Task2Prompt question={task2Q} wordCount={task2Words} />
//               )}
//             </div>
//           )}

//           {/* Right — Writing Area (stays fixed in view on desktop) */}
//           <div className="lg:h-full lg:min-h-0 flex flex-col">
//             <WritingArea
//               value={activeTask === 1 ? task1Text : task2Text}
//               onChange={(val) => activeTask === 1 ? setTask1Text(val) : setTask2Text(val)}
//               minimum={activeTask === 1 ? 150 : 250}
//               isFocusMode={focusMode}
//               onToggleFocusMode={() => setFocusMode((f) => !f)}
//               placeholder={
//                 activeTask === 1
//                   ? "Begin your report here. Start with an introduction that paraphrases the chart description..."
//                   : "Begin your essay here. Start with an introduction that paraphrases the topic and states your position..."
//               }
//             />
//           </div>
//         </div>
//       </main>

//       {/* ── Bottom Action Bar ── */}
//       <footer className="shrink-0 px-4 pb-4">
//         <div className="max-w-6xl mx-auto bg-card border border-border rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">

//           <Button
//             variant="ghost"
//             size="sm"
//             className="gap-1 text-muted-foreground"
//             disabled={activeTask === 1}
//             onClick={() => setActiveTask(1)}
//           >
//             <ChevronLeft className="w-4 h-4" />
//             Previous Task
//           </Button>

//           <div className="flex items-center gap-4 flex-wrap justify-center">
//             <div className="flex items-center gap-2 text-xs">
//               <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
//                 T1 {task1Words}/150
//               </span>
//               <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
//                 T2 {task2Words}/250
//               </span>
//             </div>

//             <Button size="sm" className="gap-2" onClick={() => setShowSubmitDialog(true)}>
//               <Send className="w-4 h-4" />
//               Submit Writing Test
//             </Button>

//             {!wordLimitsMet && (
//               <span className="text-xs text-amber-500 font-medium">Word limits not met</span>
//             )}
//           </div>

//           <Button
//             variant="ghost"
//             size="sm"
//             className="gap-1 text-muted-foreground"
//             disabled={activeTask === 2}
//             onClick={() => setActiveTask(2)}
//           >
//             Next Task
//             <ChevronRight className="w-4 h-4" />
//           </Button>
//         </div>
//       </footer>

//       {/* Submit Dialog */}
//       <SubmitDialog
//         open={showSubmitDialog}
//         onClose={() => setShowSubmitDialog(false)}
//         onConfirm={() => { setShowSubmitDialog(false); handleSubmit() }}
//         task1Words={task1Words}
//         task2Words={task2Words}
//       />

//       {/* Errors that happen mid-test (submission failures, storage issues) */}
//       <ErrorModal banner={submitBanner} onClose={() => setSubmitBanner(null)} />
//     </div>
//   )
// }




















































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

    const stored = (safeSessionStorage.get("ielts_test_type") as TestType) || "academic"
    setTestType(stored)

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setLoading(false)
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

        const saved = safeSessionStorage.set("ielts_results", JSON.stringify(result))
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

  // ── Load-failure screen (full screen — nothing has been written yet) ──
  if (loadBanner || !task1Q || !task2Q) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-foreground font-semibold">
          {loadBanner?.title || "Failed to load questions"}
        </p>
        <p className="text-sm text-muted-foreground max-w-sm">
          {loadBanner?.message || "Something went wrong while preparing your test."}
        </p>
        <Button onClick={() => loadQuestions()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
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