"use client";

// app/listening/page.tsx — Listening Module Instructions Page

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Headphones, AlertCircle, CheckCircle2, ChevronRight, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorModal } from "@/components/writing/error-modal";
import type { Banner } from "@/lib/reading-network-utils";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const rules = [
  { icon: CheckCircle2, text: "4 Sections (Everyday → Academic)", ok: true },
  { icon: CheckCircle2, text: "Total 40 Questions (10 per section)", ok: true },
  { icon: CheckCircle2, text: "Multiple question formats (MCQ, Matching, Completion)", ok: true },
  { icon: AlertCircle, text: "Audio plays ONCE — listen carefully", ok: false },
  { icon: AlertCircle, text: "No pause/rewind during real IELTS", ok: false },
  { icon: AlertCircle, text: "Auto-submits when the 30-min timer ends", ok: false },
];

export default function ListeningInstructionsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
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
    if (!isOnline) {
      setBanner({
        kind: "warning",
        title: "You're offline",
        message:
          "The listening test needs an internet connection to load questions and submit answers. Please reconnect before continuing.",
        action: { label: "Try again", run: () => { setBanner(null); handleContinue(); } },
      });
      return;
    }

    try {
      router.push("/listening/test?fresh=true");
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-background flex flex-col justify-between">
      <Navbar />

      <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center px-4 py-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Headphones className="w-3.5 h-3.5" />
            IELTS Academic Listening
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight mb-2">
            LISTENING TEST
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Read the instructions carefully before you begin your session.
          </p>
          {!isOnline && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
              <WifiOff className="w-3.5 h-3.5" /> You're currently offline
            </div>
          )}
        </div>

        {/* Timer + Sections + Questions — summary row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <Clock className="w-5 h-5 text-sky-500 mb-1.5" />
            <p className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">30 Min</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight mt-0.5">Total time</p>
          </div>
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-4 text-center shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sections</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">4</div>
            <div className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-0.5">Everyday → Academic</div>
          </div>
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-2xl p-4 text-center shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Questions</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">40</div>
            <div className="text-[10px] text-slate-400 mt-0.5">10 per section</div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 mb-6 shadow-sm">
          <h2 className="text-xs font-black text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-wider">
            Important Exam Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
            {rules.map(({ icon: Icon, text, ok }, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ok ? "text-emerald-500" : "text-amber-500"}`} />
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full h-12 text-sm font-bold rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-[0_4px_14px_rgba(2,132,199,0.3)] transition-all"
          onClick={handleContinue}
        >
          Start Listening Test
          <ChevronRight className="w-4 h-4 ml-1.5" />
        </Button>
      </main>

      <Footer />

      <ErrorModal banner={banner} onClose={() => setBanner(null)} />
    </div>
  );
}
