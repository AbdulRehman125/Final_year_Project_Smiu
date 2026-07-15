// "use client"

// // app/writing/test/page.tsx — Main Test Screen

// import { useState, useEffect, useRef, useCallback } from "react"
// import { useRouter } from "next/navigation"
// import { Clock, Send, AlertTriangle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { WritingArea } from "@/components/writing/writing-area"
// import { WordCounter } from "@/components/writing/word-counter"
// import { Task1Prompt } from "@/components/writing/task1-prompt"
// import { Task2Prompt } from "@/components/writing/task2-prompt"
// import { SubmitDialog } from "@/components/writing/submit-dialog"
// import {
//   evaluateWriting,
//   SAMPLE_TASK1_ACADEMIC,
//   SAMPLE_TASK2,
//   type TestType,
// } from "@/lib/writing-types"

// const TOTAL_SECONDS = 60 * 60 // 60 minutes

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
//   const [activeTask, setActiveTask] = useState<1 | 2>(1)
//   const [task1Text, setTask1Text] = useState("")
//   const [task2Text, setTask2Text] = useState("")
//   const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [showSubmitDialog, setShowSubmitDialog] = useState(false)
//   const [testType, setTestType] = useState<TestType>("academic")
//   const startTimeRef = useRef(Date.now())
//   const hasSubmitted = useRef(false)

//   // Read test type from session storage
//   useEffect(() => {
//     const stored = sessionStorage.getItem("ielts_test_type") as TestType
//     if (stored) setTestType(stored)
//   }, [])

//   const handleSubmit = useCallback(async () => {
//     if (hasSubmitted.current) return
//     hasSubmitted.current = true
//     setIsSubmitting(true)

//     const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)

//     try {
//       const result = await evaluateWriting({
//         test_type: testType,
//         task1_question: SAMPLE_TASK1_ACADEMIC,
//         task2_question: SAMPLE_TASK2,
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
//   }, [task1Text, task2Text, testType, router])

//   // Countdown timer
//   useEffect(() => {
//     if (timeLeft <= 0) {
//       handleSubmit()
//       return
//     }
//     const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
//     return () => clearInterval(id)
//   }, [timeLeft, handleSubmit])

//   const task1Words = countWords(task1Text)
//   const task2Words = countWords(task2Text)
//   const isWarning = timeLeft <= 300 // last 5 min
//   const isCritical = timeLeft <= 60  // last 1 min

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
//     <div className="min-h-screen bg-background flex flex-col">

//       {/* ── Top Bar ── */}
//       <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
//         <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

//           {/* Task Tabs */}
//           <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
//             {([1, 2] as const).map((task) => (
//               <button
//                 key={task}
//                 onClick={() => setActiveTask(task)}
//                 className={cn(
//                   "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
//                   activeTask === task
//                     ? "bg-background text-foreground shadow-sm"
//                     : "text-muted-foreground hover:text-foreground"
//                 )}
//               >
//                 Task {task}
//                 <span className={cn(
//                   "ml-2 text-xs",
//                   task === 1
//                     ? task1Words >= 150 ? "text-emerald-500" : task1Words >= 100 ? "text-amber-500" : "text-muted-foreground"
//                     : task2Words >= 250 ? "text-emerald-500" : task2Words >= 200 ? "text-amber-500" : "text-muted-foreground"
//                 )}>
//                   {task === 1 ? task1Words : task2Words}w
//                 </span>
//               </button>
//             ))}
//           </div>

//           {/* Timer */}
//           <div className={cn(
//             "flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-lg font-bold transition-all",
//             isCritical
//               ? "bg-red-500/10 text-red-500 animate-pulse"
//               : isWarning
//               ? "bg-amber-500/10 text-amber-500"
//               : "bg-muted text-foreground"
//           )}>
//             <Clock className="w-4 h-4" />
//             {formatTime(timeLeft)}
//           </div>

//           {/* Submit */}
//           <Button
//             size="sm"
//             variant="outline"
//             className="gap-2"
//             onClick={() => setShowSubmitDialog(true)}
//           >
//             <Send className="w-4 h-4" />
//             Submit
//           </Button>
//         </div>
//       </header>

//       {/* ── Warning Banner ── */}
//       {isWarning && !isCritical && (
//         <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
//           <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
//             <AlertTriangle className="w-4 h-4" />
//             5 minutes remaining — both tasks will auto-submit when the timer ends.
//           </p>
//         </div>
//       )}
//       {isCritical && (
//         <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-center">
//           <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
//             <AlertTriangle className="w-4 h-4" />
//             Less than 1 minute! Finish your writing now.
//           </p>
//         </div>
//       )}

//       {/* ── Main Content ── */}
//       <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

//           {/* Left — Prompt */}
//           <div className="lg:sticky lg:top-20 lg:self-start">
//             {activeTask === 1 ? (
//               <Task1Prompt question={SAMPLE_TASK1_ACADEMIC} testType={testType} />
//             ) : (
//               <Task2Prompt question={SAMPLE_TASK2} />
//             )}
//           </div>

//           {/* Right — Writing Area */}
//           <div className="flex flex-col gap-3">
//             <WritingArea
//               value={activeTask === 1 ? task1Text : task2Text}
//               onChange={(val) =>
//                 activeTask === 1 ? setTask1Text(val) : setTask2Text(val)
//               }
//               placeholder={
//                 activeTask === 1
//                   ? "Begin your report here. Start with an introduction that paraphrases the chart description..."
//                   : "Begin your essay here. Start with an introduction that paraphrases the topic and states your position..."
//               }
//             />
//             <WordCounter
//               count={activeTask === 1 ? task1Words : task2Words}
//               minimum={activeTask === 1 ? 150 : 250}
//               task={activeTask}
//             />
//           </div>
//         </div>
//       </main>

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
// import { Clock, Send, AlertTriangle, Loader2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { WritingArea } from "@/components/writing/writing-area"
// import { WordCounter } from "@/components/writing/word-counter"
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
//     <div className="min-h-screen bg-background flex flex-col">

//       {/* ── Top Bar ── */}
//       <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
//         <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

//           {/* Task Tabs */}
//           <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
//             {([1, 2] as const).map((task) => (
//               <button
//                 key={task}
//                 onClick={() => setActiveTask(task)}
//                 className={cn(
//                   "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
//                   activeTask === task
//                     ? "bg-background text-foreground shadow-sm"
//                     : "text-muted-foreground hover:text-foreground"
//                 )}
//               >
//                 Task {task}
//                 <span className={cn(
//                   "ml-2 text-xs",
//                   task === 1
//                     ? task1Words >= 150 ? "text-emerald-500" : task1Words >= 100 ? "text-amber-500" : "text-muted-foreground"
//                     : task2Words >= 250 ? "text-emerald-500" : task2Words >= 200 ? "text-amber-500" : "text-muted-foreground"
//                 )}>
//                   {task === 1 ? task1Words : task2Words}w
//                 </span>
//               </button>
//             ))}
//           </div>

//           {/* Timer */}
//           <div className={cn(
//             "flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono text-lg font-bold transition-all",
//             isCritical ? "bg-red-500/10 text-red-500 animate-pulse"
//             : isWarning ? "bg-amber-500/10 text-amber-500"
//             : "bg-muted text-foreground"
//           )}>
//             <Clock className="w-4 h-4" />
//             {formatTime(timeLeft)}
//           </div>

//           {/* Submit Button */}
//           <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowSubmitDialog(true)}>
//             <Send className="w-4 h-4" />
//             Submit
//           </Button>
//         </div>
//       </header>

//       {/* ── Warning Banners ── */}
//       {isWarning && !isCritical && (
//         <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
//           <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
//             <AlertTriangle className="w-4 h-4" />
//             5 minutes remaining — both tasks will auto-submit when timer ends.
//           </p>
//         </div>
//       )}
//       {isCritical && (
//         <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-center">
//           <p className="text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
//             <AlertTriangle className="w-4 h-4" />
//             Less than 1 minute! Finish your writing now.
//           </p>
//         </div>
//       )}

//       {/* ── Main Content ── */}
//       <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//           {/* Left — Prompt (sticky on desktop) */}
//           <div className="lg:sticky lg:top-20 lg:self-start">
//             {activeTask === 1 ? (
//               <Task1Prompt question={task1Q} testType={testType} />
//             ) : (
//               <Task2Prompt question={task2Q} />
//             )}
//           </div>

//           {/* Right — Writing Area */}
//           <div className="flex flex-col gap-3">
//             <WritingArea
//               value={activeTask === 1 ? task1Text : task2Text}
//               onChange={(val) => activeTask === 1 ? setTask1Text(val) : setTask2Text(val)}
//               placeholder={
//                 activeTask === 1
//                   ? "Begin your report here. Start with an introduction that paraphrases the chart description..."
//                   : "Begin your essay here. Start with an introduction that paraphrases the topic and states your position..."
//               }
//             />
//             <WordCounter
//               count={activeTask === 1 ? task1Words : task2Words}
//               minimum={activeTask === 1 ? 150 : 250}
//               task={activeTask}
//             />
//           </div>
//         </div>
//       </main>

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
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { WritingArea } from "@/components/writing/writing-area"
// import { WordCounter } from "@/components/writing/word-counter"
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
//         <div className="max-w-6xl mx-auto lg:h-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:min-h-0">

//           {/* Left — Prompt (independently scrollable on desktop) */}
//           <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto rounded-2xl">
//             {activeTask === 1 ? (
//               <Task1Prompt question={task1Q} testType={testType} />
//             ) : (
//               <Task2Prompt question={task2Q} />
//             )}
//           </div>

//           {/* Right — Writing Area (stays fixed in view on desktop) */}
//           <div className="lg:h-full lg:min-h-0 flex flex-col gap-3">
//             <WritingArea
//               value={activeTask === 1 ? task1Text : task2Text}
//               onChange={(val) => activeTask === 1 ? setTask1Text(val) : setTask2Text(val)}
//               placeholder={
//                 activeTask === 1
//                   ? "Begin your report here. Start with an introduction that paraphrases the chart description..."
//                   : "Begin your essay here. Start with an introduction that paraphrases the topic and states your position..."
//               }
//             />
//             <WordCounter
//               count={activeTask === 1 ? task1Words : task2Words}
//               minimum={activeTask === 1 ? 150 : 250}
//               task={activeTask}
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WritingArea } from "@/components/writing/writing-area"
import { Task1Prompt } from "@/components/writing/task1-prompt"
import { Task2Prompt } from "@/components/writing/task2-prompt"
import { SubmitDialog } from "@/components/writing/submit-dialog"
import {
  fetchWritingQuestions,
  evaluateWriting,
  type TestType,
  type Task1Question,
  type Task2Question,
} from "@/lib/writing-types"

const TOTAL_SECONDS = 60 * 60

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0")
  const s = (secs % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function WritingTestPage() {
  const router = useRouter()

  // Test state
  const [testType, setTestType]       = useState<TestType>("academic")
  const [task1Q, setTask1Q]           = useState<Task1Question | null>(null)
  const [task2Q, setTask2Q]           = useState<Task2Question | null>(null)
  const [loading, setLoading]         = useState(true)
  const [loadError, setLoadError]     = useState(false)

  // Writing state
  const [activeTask, setActiveTask]   = useState<1 | 2>(1)
  const [task1Text, setTask1Text]     = useState("")
  const [task2Text, setTask2Text]     = useState("")
  const [focusMode, setFocusMode]     = useState(false)

  // Timer state
  const [timeLeft, setTimeLeft]       = useState(TOTAL_SECONDS)
  const [timerStarted, setTimerStarted] = useState(false)

  // Submit state
  const [isSubmitting, setIsSubmitting]       = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const hasSubmitted = useRef(false)
  const startTimeRef = useRef(Date.now())

  // ── Load test type + fetch questions from LLM ──
  useEffect(() => {
    const stored = sessionStorage.getItem("ielts_test_type") as TestType
    const type = stored || "academic"
    setTestType(type)

    fetchWritingQuestions(type)
      .then((data) => {
        setTask1Q(data.task1)
        setTask2Q(data.task2)
        setLoading(false)
        setTimerStarted(true)
        startTimeRef.current = Date.now()
      })
      .catch(() => {
        setLoadError(true)
        setLoading(false)
      })
  }, [])

  // ── Submit handler ──
  const handleSubmit = useCallback(async () => {
    if (hasSubmitted.current || !task1Q || !task2Q) return
    hasSubmitted.current = true
    setIsSubmitting(true)

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)

    try {
      const result = await evaluateWriting({
        test_type: testType,
        task1_question: task1Q,
        task2_question: task2Q,
        task1_response: task1Text || "(No response submitted)",
        task2_response: task2Text || "(No response submitted)",
        time_taken_seconds: timeTaken,
      })
      sessionStorage.setItem("ielts_results", JSON.stringify(result))
      router.push("/writing/results")
    } catch {
      setIsSubmitting(false)
      hasSubmitted.current = false
    }
  }, [task1Text, task2Text, testType, task1Q, task2Q, router])

  // ── Countdown timer ──
  useEffect(() => {
    if (!timerStarted) return
    if (timeLeft <= 0) { handleSubmit(); return }
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

  // ── Error screen ──
  if (loadError || !task1Q || !task2Q) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-foreground font-semibold">Failed to load questions.</p>
        <Button onClick={() => { setLoadError(false); setLoading(true); window.location.reload() }}>
          Try Again
        </Button>
      </div>
    )
  }

  // ── Evaluating screen ──
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Evaluating your test...</h2>
          <p className="text-muted-foreground">
            Our AI examiner is reviewing your writing against official IELTS band descriptors.
          </p>
        </div>
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
              <p className="text-xs text-emerald-500 flex items-center gap-1 leading-tight">
                <Save className="w-3 h-3" /> Saved
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
    </div>
  )
}