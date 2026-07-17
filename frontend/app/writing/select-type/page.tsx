// "use client"

// // app/writing/select-type/page.tsx

// import { useRouter } from "next/navigation"
// import { GraduationCap, BookOpen, ChevronLeft, ArrowRight } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { useState } from "react"
// import type { TestType } from "@/lib/writing-types"

// const types = [
//   {
//     id: "academic" as TestType,
//     icon: GraduationCap,
//     title: "Academic",
//     subtitle: "For university admission",
//     description: "Task 1: Analyse a graph, chart, table or diagram and write a report.",
//     task1: "Graph / Chart / Diagram Report",
//     task2: "Formal Academic Essay",
//     color: "from-blue-500/10 to-indigo-500/10",
//     border: "border-blue-500/30",
//     iconBg: "bg-blue-500/10",
//     iconColor: "text-blue-500",
//     badge: "Most Common",
//     badgeColor: "bg-blue-500/10 text-blue-500",
//   },
//   {
//     id: "general" as TestType,
//     icon: BookOpen,
//     title: "General Training",
//     subtitle: "For work & migration",
//     description: "Task 1: Write a letter (formal, semi-formal or informal).",
//     task1: "Letter Writing",
//     task2: "Formal Essay",
//     color: "from-emerald-500/10 to-teal-500/10",
//     border: "border-emerald-500/30",
//     iconBg: "bg-emerald-500/10",
//     iconColor: "text-emerald-500",
//     badge: null,
//     badgeColor: "",
//   },
// ]

// export default function SelectTypePage() {
//   const router = useRouter()
//   const [selected, setSelected] = useState<TestType | null>(null)

//   const handleContinue = () => {
//     if (!selected) return
//     // Store in sessionStorage for test page
//     sessionStorage.setItem("ielts_test_type", selected)
//     router.push("/writing/test")
//   }

//   return (
//     <div className="min-h-screen bg-background flex items-center justify-center p-4">
//       <div className="w-full max-w-2xl">

//         {/* Back */}
//         <button
//           onClick={() => router.back()}
//           className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Back
//         </button>

//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-2">
//             Select Test Type
//           </h1>
//           <p className="text-muted-foreground">
//             Choose the IELTS Writing format that matches your registration.
//           </p>
//         </div>

//         {/* Cards */}
//         <div className="space-y-4 mb-8">
//           {types.map((type) => (
//             <button
//               key={type.id}
//               onClick={() => setSelected(type.id)}
//               className={cn(
//                 "w-full text-left rounded-2xl border-2 p-6 transition-all duration-200",
//                 "bg-gradient-to-br",
//                 type.color,
//                 selected === type.id
//                   ? `${type.border} shadow-lg scale-[1.01]`
//                   : "border-border hover:border-muted-foreground/30"
//               )}
//             >
//               <div className="flex items-start gap-4">
//                 {/* Icon */}
//                 <div className={cn("rounded-xl p-3 flex-shrink-0", type.iconBg)}>
//                   <type.icon className={cn("w-6 h-6", type.iconColor)} />
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h3 className="text-lg font-semibold text-foreground">
//                       {type.title}
//                     </h3>
//                     {type.badge && (
//                       <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", type.badgeColor)}>
//                         {type.badge}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-sm text-muted-foreground mb-4">
//                     {type.description}
//                   </p>
//                   <div className="grid grid-cols-2 gap-3">
//                     <div className="bg-background/60 rounded-lg px-3 py-2">
//                       <div className="text-xs text-muted-foreground mb-0.5">Task 1</div>
//                       <div className="text-xs font-medium text-foreground">{type.task1}</div>
//                     </div>
//                     <div className="bg-background/60 rounded-lg px-3 py-2">
//                       <div className="text-xs text-muted-foreground mb-0.5">Task 2</div>
//                       <div className="text-xs font-medium text-foreground">{type.task2}</div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Radio */}
//                 <div className={cn(
//                   "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all",
//                   selected === type.id
//                     ? `${type.border} bg-current border-current`
//                     : "border-muted-foreground/30"
//                 )}>
//                   {selected === type.id && (
//                     <div className={cn("w-full h-full rounded-full scale-50", type.iconBg)} />
//                   )}
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>

//         {/* CTA */}
//         <Button
//           size="lg"
//           className="w-full h-14 text-base font-semibold rounded-xl"
//           disabled={!selected}
//           onClick={handleContinue}
//         >
//           Start Test
//           <ArrowRight className="w-5 h-5 ml-2" />
//         </Button>
//       </div>
//     </div>
//   )
// }































// "use client"

// // app/writing/select-type/page.tsx

// import { useRouter } from "next/navigation"
// import { GraduationCap, BookOpen, ChevronLeft, ArrowRight, Check } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { useState } from "react"
// import type { TestType } from "@/lib/writing-types"

// const types = [
//   {
//     id: "academic" as TestType,
//     icon: GraduationCap,
//     title: "Academic",
//     subtitle: "For university admission",
//     task1: "Chart / Graph Report",
//     task2: "Formal Essay",
//     accent: "text-blue-500",
//     accentBg: "bg-blue-500/10",
//     accentBorder: "border-blue-500",
//     ring: "ring-blue-500/20",
//     badge: "Most Common",
//   },
//   {
//     id: "general" as TestType,
//     icon: BookOpen,
//     title: "General Training",
//     subtitle: "For work & migration",
//     task1: "Letter Writing",
//     task2: "Formal Essay",
//     accent: "text-emerald-500",
//     accentBg: "bg-emerald-500/10",
//     accentBorder: "border-emerald-500",
//     ring: "ring-emerald-500/20",
//     badge: null,
//   },
// ]

// export default function SelectTypePage() {
//   const router = useRouter()
//   const [selected, setSelected] = useState<TestType | null>(null)

//   const handleContinue = () => {
//     if (!selected) return
//     sessionStorage.setItem("ielts_test_type", selected)
//     router.push("/writing/test")
//   }

//   return (
//     <div className="h-screen bg-background flex flex-col overflow-hidden">
//       <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center px-4 py-6 min-h-0">

//         {/* Back */}
//         <button
//           onClick={() => router.back()}
//           className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors w-fit"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Back
//         </button>

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-foreground mb-1">Select Test Type</h1>
//           <p className="text-sm text-muted-foreground">
//             Choose the IELTS Writing format that matches your registration.
//           </p>
//         </div>

//         {/* Cards — side by side, not stacked */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//           {types.map((type) => {
//             const isSelected = selected === type.id
//             return (
//               <button
//                 key={type.id}
//                 onClick={() => setSelected(type.id)}
//                 className={cn(
//                   "text-left rounded-2xl border-2 p-5 transition-all duration-150 bg-card relative",
//                   isSelected
//                     ? cn(type.accentBorder, "ring-4", type.ring)
//                     : "border-border hover:border-muted-foreground/30"
//                 )}
//               >
//                 {type.badge && (
//                   <span className="absolute -top-2.5 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
//                     {type.badge}
//                   </span>
//                 )}

//                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", type.accentBg)}>
//                   <type.icon className={cn("w-5 h-5", type.accent)} />
//                 </div>

//                 <h3 className="text-base font-semibold text-foreground mb-0.5">{type.title}</h3>
//                 <p className="text-xs text-muted-foreground mb-3">{type.subtitle}</p>

//                 <div className="flex gap-2">
//                   <div className="flex-1 bg-muted/50 rounded-lg px-2.5 py-1.5">
//                     <div className="text-[10px] text-muted-foreground">Task 1</div>
//                     <div className="text-xs font-medium text-foreground truncate">{type.task1}</div>
//                   </div>
//                   <div className="flex-1 bg-muted/50 rounded-lg px-2.5 py-1.5">
//                     <div className="text-[10px] text-muted-foreground">Task 2</div>
//                     <div className="text-xs font-medium text-foreground truncate">{type.task2}</div>
//                   </div>
//                 </div>

//                 <div className={cn(
//                   "absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
//                   isSelected ? cn(type.accentBorder, type.accentBg) : "border-muted-foreground/30",
//                   type.badge && "top-9"
//                 )}>
//                   {isSelected && <Check className={cn("w-3 h-3", type.accent)} />}
//                 </div>
//               </button>
//             )
//           })}
//         </div>

//         {/* CTA */}
//         <Button
//           size="lg"
//           className="w-full h-12 text-sm font-semibold rounded-xl"
//           disabled={!selected}
//           onClick={handleContinue}
//         >
//           Start Test
//           <ArrowRight className="w-4 h-4 ml-2" />
//         </Button>
//       </div>
//     </div>
//   )
// }


























// "use client"

// // app/writing/select-type/page.tsx

// import { useRouter } from "next/navigation"
// import { GraduationCap, BookOpen, ChevronLeft, ArrowRight, Check, WifiOff } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { cn } from "@/lib/utils"
// import { useState } from "react"
// import type { TestType } from "@/lib/writing-types"
// import { ErrorModal } from "@/components/writing/error-modal"
// import { safeSessionStorage, type Banner } from "@/lib/writing-network-utils"

// const types = [
//   {
//     id: "academic" as TestType,
//     icon: GraduationCap,
//     title: "Academic",
//     subtitle: "For university admission",
//     task1: "Chart / Graph Report",
//     task2: "Formal Essay",
//     accent: "text-blue-500",
//     accentBg: "bg-blue-500/10",
//     accentBorder: "border-blue-500",
//     ring: "ring-blue-500/20",
//     badge: "Most Common",
//   },
//   {
//     id: "general" as TestType,
//     icon: BookOpen,
//     title: "General Training",
//     subtitle: "For work & migration",
//     task1: "Letter Writing",
//     task2: "Formal Essay",
//     accent: "text-emerald-500",
//     accentBg: "bg-emerald-500/10",
//     accentBorder: "border-emerald-500",
//     ring: "ring-emerald-500/20",
//     badge: null,
//   },
// ]

// export default function SelectTypePage() {
//   const router = useRouter()
//   const [selected, setSelected] = useState<TestType | null>(null)
//   const [banner, setBanner] = useState<Banner | null>(null)

//   const handleContinue = () => {
//     if (!selected) return

//     // The test screen fetches live questions over the network — warn now
//     // rather than let the candidate hit a wall on the next screen.
//     if (typeof navigator !== "undefined" && !navigator.onLine) {
//       setBanner({
//         kind: "warning",
//         title: "You're offline",
//         message: "You need an internet connection to start the test. Reconnect and try again.",
//         action: { label: "Try again", run: () => { setBanner(null); handleContinue() } },
//       })
//       return
//     }

//     // sessionStorage can throw in private/incognito mode or when storage is
//     // disabled — don't let that silently drop the candidate's selection.
//     const saved = safeSessionStorage.set("ielts_test_type", selected)
//     if (!saved) {
//       setBanner({
//         kind: "error",
//         title: "Couldn't save your selection",
//         message:
//           "Your browser is blocking site storage (this can happen in private/incognito mode). Please allow storage for this site and try again.",
//         action: { label: "Try again", run: () => { setBanner(null); handleContinue() } },
//       })
//       return
//     }

//     try {
//       router.push("/writing/test")
//     } catch (e) {
//       console.error("Navigation failed", e)
//       setBanner({
//         kind: "error",
//         title: "Couldn't start the test",
//         message: "Something went wrong opening the test screen. Please try again.",
//         action: { label: "Try again", run: () => { setBanner(null); handleContinue() } },
//       })
//     }
//   }

//   return (
//     <div className="h-screen bg-background flex flex-col overflow-hidden">
//       <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center px-4 py-6 min-h-0">

//         {/* Back */}
//         <button
//           onClick={() => {
//             try {
//               router.back()
//             } catch (e) {
//               console.error("Back navigation failed", e)
//             }
//           }}
//           className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors w-fit"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Back
//         </button>

//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between gap-3">
//           <div>
//             <h1 className="text-2xl font-bold text-foreground mb-1">Select Test Type</h1>
//             <p className="text-sm text-muted-foreground">
//               Choose the IELTS Writing format that matches your registration.
//             </p>
//           </div>
//           {typeof navigator !== "undefined" && !navigator.onLine && (
//             <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
//               <WifiOff className="w-3.5 h-3.5" /> Offline
//             </span>
//           )}
//         </div>

//         {/* Cards — side by side, not stacked */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//           {types.map((type) => {
//             const isSelected = selected === type.id
//             return (
//               <button
//                 key={type.id}
//                 onClick={() => setSelected(type.id)}
//                 className={cn(
//                   "text-left rounded-2xl border-2 p-5 transition-all duration-150 bg-card relative",
//                   isSelected
//                     ? cn(type.accentBorder, "ring-4", type.ring)
//                     : "border-border hover:border-muted-foreground/30"
//                 )}
//               >
//                 {type.badge && (
//                   <span className="absolute -top-2.5 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
//                     {type.badge}
//                   </span>
//                 )}

//                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", type.accentBg)}>
//                   <type.icon className={cn("w-5 h-5", type.accent)} />
//                 </div>

//                 <h3 className="text-base font-semibold text-foreground mb-0.5">{type.title}</h3>
//                 <p className="text-xs text-muted-foreground mb-3">{type.subtitle}</p>

//                 <div className="flex gap-2">
//                   <div className="flex-1 bg-muted/50 rounded-lg px-2.5 py-1.5">
//                     <div className="text-[10px] text-muted-foreground">Task 1</div>
//                     <div className="text-xs font-medium text-foreground truncate">{type.task1}</div>
//                   </div>
//                   <div className="flex-1 bg-muted/50 rounded-lg px-2.5 py-1.5">
//                     <div className="text-[10px] text-muted-foreground">Task 2</div>
//                     <div className="text-xs font-medium text-foreground truncate">{type.task2}</div>
//                   </div>
//                 </div>

//                 <div className={cn(
//                   "absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
//                   isSelected ? cn(type.accentBorder, type.accentBg) : "border-muted-foreground/30",
//                   type.badge && "top-9"
//                 )}>
//                   {isSelected && <Check className={cn("w-3 h-3", type.accent)} />}
//                 </div>
//               </button>
//             )
//           })}
//         </div>

//         {/* CTA */}
//         <Button
//           size="lg"
//           className="w-full h-12 text-sm font-semibold rounded-xl"
//           disabled={!selected}
//           onClick={handleContinue}
//         >
//           Start Test
//           <ArrowRight className="w-4 h-4 ml-2" />
//         </Button>
//       </div>

//       <ErrorModal banner={banner} onClose={() => setBanner(null)} />
//     </div>
//   )
// }




































"use client"

// app/writing/select-type/page.tsx

import { useRouter } from "next/navigation"
import { GraduationCap, BookOpen, ChevronLeft, ArrowRight, Check, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import type { TestType } from "@/lib/writing-types"
import { ErrorModal } from "@/components/writing/error-modal"
import { safeSessionStorage, type Banner } from "@/lib/writing-network-utils"

const types = [
  {
    id: "academic" as TestType,
    icon: GraduationCap,
    title: "Academic",
    subtitle: "For university admission",
    task1: "Chart / Graph Report",
    task2: "Formal Essay",
    accent: "text-blue-500",
    accentBg: "bg-blue-500/10",
    accentBorder: "border-blue-500",
    ring: "ring-blue-500/20",
    badge: "Most Common",
  },
  {
    id: "general" as TestType,
    icon: BookOpen,
    title: "General Training",
    subtitle: "For work & migration",
    task1: "Letter Writing",
    task2: "Formal Essay",
    accent: "text-emerald-500",
    accentBg: "bg-emerald-500/10",
    accentBorder: "border-emerald-500",
    ring: "ring-emerald-500/20",
    badge: null,
  },
]

export default function SelectTypePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<TestType | null>(null)
  const [banner, setBanner] = useState<Banner | null>(null)

  // Same reasoning as the instructions page: never branch render output on
  // navigator.onLine directly (server has no navigator at all) — track it
  // via state that only updates after mount, so SSR and the first client
  // render always agree.
  const [isOnline, setIsOnline] = useState(true)
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  const handleContinue = () => {
    if (!selected) return

    // The test screen fetches live questions over the network — warn now
    // rather than let the candidate hit a wall on the next screen.
    if (!isOnline) {
      setBanner({
        kind: "warning",
        title: "You're offline",
        message: "You need an internet connection to start the test. Reconnect and try again.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue() } },
      })
      return
    }

    // sessionStorage can throw in private/incognito mode or when storage is
    // disabled — don't let that silently drop the candidate's selection.
    const saved = safeSessionStorage.set("ielts_test_type", selected)
    if (!saved) {
      setBanner({
        kind: "error",
        title: "Couldn't save your selection",
        message:
          "Your browser is blocking site storage (this can happen in private/incognito mode). Please allow storage for this site and try again.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue() } },
      })
      return
    }

    try {
      router.push("/writing/test")
    } catch (e) {
      console.warn("Navigation failed", e)
      setBanner({
        kind: "error",
        title: "Couldn't start the test",
        message: "Something went wrong opening the test screen. Please try again.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue() } },
      })
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center px-4 py-6 min-h-0">

        {/* Back */}
        <button
          onClick={() => {
            try {
              router.back()
            } catch (e) {
              console.warn("Back navigation failed", e)
            }
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Select Test Type</h1>
            <p className="text-sm text-muted-foreground">
              Choose the IELTS Writing format that matches your registration.
            </p>
          </div>
          {!isOnline && (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
              <WifiOff className="w-3.5 h-3.5" /> Offline
            </span>
          )}
        </div>

        {/* Cards — side by side, not stacked */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {types.map((type) => {
            const isSelected = selected === type.id
            return (
              <button
                key={type.id}
                onClick={() => setSelected(type.id)}
                className={cn(
                  "text-left rounded-2xl border-2 p-5 transition-all duration-150 bg-card relative",
                  isSelected
                    ? cn(type.accentBorder, "ring-4", type.ring)
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                {type.badge && (
                  <span className="absolute -top-2.5 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white">
                    {type.badge}
                  </span>
                )}

                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", type.accentBg)}>
                  <type.icon className={cn("w-5 h-5", type.accent)} />
                </div>

                <h3 className="text-base font-semibold text-foreground mb-0.5">{type.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{type.subtitle}</p>

                <div className="flex gap-2">
                  <div className="flex-1 bg-muted/50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[10px] text-muted-foreground">Task 1</div>
                    <div className="text-xs font-medium text-foreground truncate">{type.task1}</div>
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[10px] text-muted-foreground">Task 2</div>
                    <div className="text-xs font-medium text-foreground truncate">{type.task2}</div>
                  </div>
                </div>

                <div className={cn(
                  "absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected ? cn(type.accentBorder, type.accentBg) : "border-muted-foreground/30",
                  type.badge && "top-9"
                )}>
                  {isSelected && <Check className={cn("w-3 h-3", type.accent)} />}
                </div>
              </button>
            )
          })}
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full h-12 text-sm font-semibold rounded-xl"
          disabled={!selected}
          onClick={handleContinue}
        >
          Start Test
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <ErrorModal banner={banner} onClose={() => setBanner(null)} />
    </div>
  )
}