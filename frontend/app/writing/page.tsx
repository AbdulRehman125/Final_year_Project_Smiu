"use client"

// app/writing/page.tsx — Instructions Page

import { useRouter } from "next/navigation"
import { Clock, FileText, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const rules = [
  { icon: CheckCircle2, text: "Task 1: Write at least 150 words (report/letter)" },
  { icon: CheckCircle2, text: "Task 2: Write at least 250 words (essay)" },
  { icon: CheckCircle2, text: "Task 2 carries twice the weight of Task 1" },
  { icon: AlertCircle, text: "Do NOT use bullet points or note form" },
  { icon: AlertCircle, text: "Do NOT copy the question wording directly" },
  { icon: AlertCircle, text: "Both tasks auto-submit when the timer ends" },
]

export default function WritingInstructionsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            IELTS Academic Writing
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Writing Test
          </h1>
          <p className="text-muted-foreground text-lg">
            Read the instructions carefully before you begin.
          </p>
        </div>

        {/* Timer Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div className="bg-primary/10 rounded-xl p-4">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">60 Minutes</p>
            <p className="text-muted-foreground text-sm mt-0.5">
              One timer for both tasks. You manage your own time between Task 1 and Task 2.
            </p>
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Task 1</div>
            <div className="text-3xl font-bold text-foreground mb-1">150+</div>
            <div className="text-sm text-muted-foreground">words required</div>
            <div className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              Recommended: ~20 min
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Task 2</div>
            <div className="text-3xl font-bold text-foreground mb-1">250+</div>
            <div className="text-sm text-muted-foreground">words required</div>
            <div className="mt-3 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              Recommended: ~40 min
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
            Important Rules
          </h2>
          <ul className="space-y-3">
            {rules.map(({ icon: Icon, text }, i) => (
              <li key={i} className="flex items-start gap-3">
                <Icon
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    Icon === AlertCircle ? "text-amber-500" : "text-emerald-500"
                  }`}
                />
                <span className="text-sm text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-xl"
          onClick={() => router.push("/writing/select-type")}
        >
          I Understand — Continue
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
