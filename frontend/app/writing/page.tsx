// "use client"

// // app/writing/page.tsx — Instructions Page

// import { useRouter } from "next/navigation"
// import { Clock, FileText, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"
// import { Button } from "@/components/ui/button"

// const rules = [
//   { icon: CheckCircle2, text: "Task 1: Write at least 150 words (report/letter)" },
//   { icon: CheckCircle2, text: "Task 2: Write at least 250 words (essay)" },
//   { icon: CheckCircle2, text: "Task 2 carries twice the weight of Task 1" },
//   { icon: AlertCircle, text: "Do NOT use bullet points or note form" },
//   { icon: AlertCircle, text: "Do NOT copy the question wording directly" },
//   { icon: AlertCircle, text: "Both tasks auto-submit when the timer ends" },
// ]

// export default function WritingInstructionsPage() {
//   const router = useRouter()

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-2xl">

//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
//             <FileText className="w-4 h-4" />
//             IELTS Academic Writing
//           </div>
//           <h1 className="text-4xl font-bold text-foreground mb-3">
//             Writing Test
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Read the instructions carefully before you begin.
//           </p>
//         </div>

//         {/* Timer Card */}
//         <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6 flex items-center gap-5">
//           <div className="bg-primary/10 rounded-xl p-4">
//             <Clock className="w-8 h-8 text-primary" />
//           </div>
//           <div>
//             <p className="text-2xl font-bold text-foreground">60 Minutes</p>
//             <p className="text-muted-foreground text-sm mt-0.5">
//               One timer for both tasks. You manage your own time between Task 1 and Task 2.
//             </p>
//           </div>
//         </div>

//         {/* Tasks Overview */}
//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <div className="bg-card border border-border rounded-2xl p-5">
//             <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Task 1</div>
//             <div className="text-3xl font-bold text-foreground mb-1">150+</div>
//             <div className="text-sm text-muted-foreground">words required</div>
//             <div className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
//               Recommended: ~20 min
//             </div>
//           </div>
//           <div className="bg-card border border-border rounded-2xl p-5">
//             <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Task 2</div>
//             <div className="text-3xl font-bold text-foreground mb-1">250+</div>
//             <div className="text-sm text-muted-foreground">words required</div>
//             <div className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
//               Recommended: ~40 min
//             </div>
//           </div>
//         </div>

//         {/* Rules */}
//         <div className="bg-card border border-border rounded-2xl p-6 mb-8">
//           <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
//             Important Rules
//           </h2>
//           <ul className="space-y-3">
//             {rules.map(({ icon: Icon, text }, i) => (
//               <li key={i} className="flex items-start gap-3">
//                 <Icon
//                   className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
//                     Icon === AlertCircle ? "text-amber-500" : "text-emerald-500"
//                   }`}
//                 />
//                 <span className="text-sm text-muted-foreground">{text}</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* CTA */}
//         <Button
//           size="lg"
//           className="w-full h-14 text-base font-semibold rounded-xl"
//           onClick={() => router.push("/writing/select-type")}
//         >
//           I Understand — Continue
//           <ChevronRight className="w-5 h-5 ml-2" />
//         </Button>
//       </div>
//     </div>
//   )
// }




































"use client"

// app/writing/page.tsx — Instructions Page

import { useRouter } from "next/navigation"
import { Clock, FileText, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const rules = [
  { icon: CheckCircle2, text: "Task 1: min. 150 words (report/letter)", ok: true },
  { icon: CheckCircle2, text: "Task 2: min. 250 words (essay)", ok: true },
  { icon: CheckCircle2, text: "Task 2 carries twice the weight", ok: true },
  { icon: AlertCircle, text: "No bullet points or note form", ok: false },
  { icon: AlertCircle, text: "Don't copy the question wording", ok: false },
  { icon: AlertCircle, text: "Auto-submits when the timer ends", ok: false },
]

export default function WritingInstructionsPage() {
  const router = useRouter()

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center px-4 py-6 min-h-0">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-3">
            <FileText className="w-3.5 h-3.5" />
            IELTS Academic Writing
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Writing Test</h1>
          <p className="text-muted-foreground text-sm">
            Read the instructions carefully before you begin.
          </p>
        </div>

        {/* Timer + Tasks — one compact row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Clock className="w-5 h-5 text-primary mb-1.5" />
            <p className="text-lg font-bold text-foreground leading-tight">60 Min</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Shared timer</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Task 1</div>
            <div className="text-lg font-bold text-foreground leading-tight">150+</div>
            <div className="text-[11px] text-muted-foreground">words · ~20 min</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Task 2</div>
            <div className="text-lg font-bold text-foreground leading-tight">250+</div>
            <div className="text-[11px] text-muted-foreground">words · ~40 min</div>
          </div>
        </div>

        {/* Rules — condensed 2-column grid */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
            Important Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
            {rules.map(({ icon: Icon, text, ok }, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ok ? "text-emerald-500" : "text-amber-500"}`} />
                <span className="text-sm text-muted-foreground leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full h-12 text-sm font-semibold rounded-xl"
          onClick={() => router.push("/writing/select-type")}
        >
          I Understand — Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}