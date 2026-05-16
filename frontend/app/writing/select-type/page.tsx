"use client"

// app/writing/select-type/page.tsx

import { useRouter } from "next/navigation"
import { GraduationCap, BookOpen, ChevronLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import type { TestType } from "@/lib/writing-types"

const types = [
  {
    id: "academic" as TestType,
    icon: GraduationCap,
    title: "Academic",
    subtitle: "For university admission",
    description: "Task 1: Analyse a graph, chart, table or diagram and write a report.",
    task1: "Graph / Chart / Diagram Report",
    task2: "Formal Academic Essay",
    color: "from-blue-500/10 to-indigo-500/10",
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    badge: "Most Common",
    badgeColor: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "general" as TestType,
    icon: BookOpen,
    title: "General Training",
    subtitle: "For work & migration",
    description: "Task 1: Write a letter (formal, semi-formal or informal).",
    task1: "Letter Writing",
    task2: "Formal Essay",
    color: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    badge: null,
    badgeColor: "",
  },
]

export default function SelectTypePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<TestType | null>(null)

  const handleContinue = () => {
    if (!selected) return
    // Store in sessionStorage for test page
    sessionStorage.setItem("ielts_test_type", selected)
    router.push("/writing/test")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Select Test Type
          </h1>
          <p className="text-muted-foreground">
            Choose the IELTS Writing format that matches your registration.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4 mb-8">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={cn(
                "w-full text-left rounded-2xl border-2 p-6 transition-all duration-200",
                "bg-gradient-to-br",
                type.color,
                selected === type.id
                  ? `${type.border} shadow-lg scale-[1.01]`
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn("rounded-xl p-3 flex-shrink-0", type.iconBg)}>
                  <type.icon className={cn("w-6 h-6", type.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {type.title}
                    </h3>
                    {type.badge && (
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", type.badgeColor)}>
                        {type.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/60 rounded-lg px-3 py-2">
                      <div className="text-xs text-muted-foreground mb-0.5">Task 1</div>
                      <div className="text-xs font-medium text-foreground">{type.task1}</div>
                    </div>
                    <div className="bg-background/60 rounded-lg px-3 py-2">
                      <div className="text-xs text-muted-foreground mb-0.5">Task 2</div>
                      <div className="text-xs font-medium text-foreground">{type.task2}</div>
                    </div>
                  </div>
                </div>

                {/* Radio */}
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all",
                  selected === type.id
                    ? `${type.border} bg-current border-current`
                    : "border-muted-foreground/30"
                )}>
                  {selected === type.id && (
                    <div className={cn("w-full h-full rounded-full scale-50", type.iconBg)} />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full h-14 text-base font-semibold rounded-xl"
          disabled={!selected}
          onClick={handleContinue}
        >
          Start Test
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
