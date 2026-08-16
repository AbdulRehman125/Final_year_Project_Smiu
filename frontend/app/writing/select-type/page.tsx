"use client";

// app/writing/select-type/page.tsx

import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, ChevronLeft, ArrowRight, Check, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import type { TestType } from "@/lib/writing-types";
import { ErrorModal } from "@/components/writing/error-modal";
import { safeSessionStorage, type Banner } from "@/lib/writing-network-utils";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const types = [
  {
    id: "academic" as TestType,
    icon: GraduationCap,
    title: "Academic",
    subtitle: "For university admission",
    task1: "Chart / Graph Report",
    task2: "Formal Essay",
    accent: "text-sky-600 dark:text-sky-400",
    accentBg: "bg-sky-50 dark:bg-sky-950/60",
    accentBorder: "border-sky-500",
    ring: "ring-sky-500/20",
    badge: "Most Common",
  },
  {
    id: "general" as TestType,
    icon: BookOpen,
    title: "General Training",
    subtitle: "For work & migration",
    task1: "Letter Writing",
    task2: "Formal Essay",
    accent: "text-emerald-600 dark:text-emerald-400",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/60",
    accentBorder: "border-emerald-500",
    ring: "ring-emerald-500/20",
    badge: null,
  },
];

export default function SelectTypePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [selected, setSelected] = useState<TestType | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/auth/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const handleContinue = () => {
    if (!selected) return;

    if (!isOnline) {
      setBanner({
        kind: "warning",
        title: "You're offline",
        message: "You need an internet connection to start the test. Reconnect and try again.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue(); } },
      });
      return;
    }

    const saved = safeSessionStorage.set("ielts_test_type", selected);
    if (!saved) {
      setBanner({
        kind: "error",
        title: "Couldn't save your selection",
        message:
          "Your browser is blocking site storage (this can happen in private/incognito mode). Please allow storage for this site and try again.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue(); } },
      });
      return;
    }

    try {
      router.push("/writing/test");
    } catch (e) {
      console.warn("Navigation failed", e);
      setBanner({
        kind: "error",
        title: "Couldn't start the test",
        message: "Something went wrong opening the test screen. Please try again.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue(); } },
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex flex-col justify-between">
      <Navbar />

      <main className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center px-4 py-10">
        {/* Back */}
        <button
          onClick={() => {
            try {
              router.back();
            } catch (e) {
              console.warn("Back navigation failed", e);
            }
          }}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors w-fit font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-1">
              Select Test Type
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Choose the IELTS Writing format that matches your registration.
            </p>
          </div>
          {!isOnline && (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
              <WifiOff className="w-3.5 h-3.5" /> Offline
            </span>
          )}
        </div>

        {/* Cards — side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {types.map((type) => {
            const isSelected = selected === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelected(type.id)}
                className={cn(
                  "text-left rounded-[24px] border-2 p-5 transition-all duration-150 bg-white dark:bg-card relative shadow-sm",
                  isSelected
                    ? cn(type.accentBorder, "ring-4", type.ring)
                    : "border-slate-200/80 dark:border-border/60 hover:border-slate-300 dark:hover:border-border"
                )}
              >
                {type.badge && (
                  <span className="absolute -top-2.5 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500 text-white shadow-sm">
                    {type.badge}
                  </span>
                )}

                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", type.accentBg)}>
                  <type.icon className={cn("w-5 h-5", type.accent)} />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-0.5">{type.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{type.subtitle}</p>

                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl px-2.5 py-1.5 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400">Task 1</div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{type.task1}</div>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl px-2.5 py-1.5 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400">Task 2</div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{type.task2}</div>
                  </div>
                </div>

                <div className={cn(
                  "absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected ? cn(type.accentBorder, type.accentBg) : "border-slate-300 dark:border-slate-600",
                  type.badge && "top-9"
                )}>
                  {isSelected && <Check className={cn("w-3 h-3", type.accent)} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full h-12 text-sm font-bold rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[0_4px_14px_rgba(2,132,199,0.3)] transition-all disabled:opacity-50"
          disabled={!selected}
          onClick={handleContinue}
        >
          Start Test
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </main>

      <Footer />

      <ErrorModal banner={banner} onClose={() => setBanner(null)} />
    </div>
  );
}