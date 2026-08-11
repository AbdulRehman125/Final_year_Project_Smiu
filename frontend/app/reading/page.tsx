"use client";

// app/reading/page.tsx — Reading Module Instructions Page

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, BookOpen, AlertCircle, CheckCircle2, ChevronRight, WifiOff, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorModal } from "@/components/writing/error-modal";
import type { Banner } from "@/lib/reading-network-utils";

const rules = [
  { icon: CheckCircle2, text: "3 Passages (Easy, Moderate, Hard)", ok: true },
  { icon: CheckCircle2, text: "Total 40 Questions (13 + 14 + 13)", ok: true },
  { icon: CheckCircle2, text: "Multiple question formats (MCQ, T/F/NG, etc.)", ok: true },
  { icon: AlertCircle, text: "No extra transfer time at the end", ok: false },
  { icon: AlertCircle, text: "Spelling and grammar count", ok: false },
  { icon: AlertCircle, text: "Auto-submits when the 60-min timer ends", ok: false },
];

export default function ReadingInstructionsPage() {
  const router = useRouter();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isOnline, setIsOnline] = useState(true);

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
    if (!isOnline) {
      setBanner({
        kind: "warning",
        title: "You're offline",
        message:
          "The reading test needs an internet connection to load questions and submit answers. Please reconnect before continuing.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue(); } },
      });
      return;
    }

    try {
      router.push("/reading/test");
    } catch (e) {
      console.warn("Navigation failed", e);
      setBanner({
        kind: "error",
        title: "Couldn't continue",
        message: "Something went wrong opening the test. Please try again.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue(); } },
      });
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center px-4 py-6 min-h-0">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            IELTS Academic Reading
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Reading Test</h1>
          <p className="text-muted-foreground text-sm">
            Read the instructions carefully before you begin.
          </p>
          {!isOnline && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
              <WifiOff className="w-3.5 h-3.5" /> You're currently offline
            </div>
          )}
        </div>

        {/* Timer + Passages + Questions — summary row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Clock className="w-5 h-5 text-primary mb-1.5" />
            <p className="text-lg font-bold text-foreground leading-tight">60 Min</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Total time</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Passages</div>
            <div className="text-lg font-bold text-foreground leading-tight">3</div>
            <div className="text-[11px] text-muted-foreground">Easy → Hard</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Questions</div>
            <div className="text-lg font-bold text-foreground leading-tight">40</div>
            <div className="text-[11px] text-muted-foreground">13 + 14 + 13</div>
          </div>
        </div>

        {/* Rules */}
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
          onClick={handleContinue}
        >
          Start Reading Test
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <ErrorModal banner={banner} onClose={() => setBanner(null)} />
    </div>
  );
}
