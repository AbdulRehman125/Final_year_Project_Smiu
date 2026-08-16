"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  BookOpen,
  PenLine,
  Headphones,
  Mic,
  ArrowRight,
  Sliders,
  Upload,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const testModules = [
    {
      title: "READING TEST",
      description:
        "3 passages, 40 questions across multiple question types. 60 minutes.",
      icon: BookOpen,
      href: "/reading",
      badges: ["3 Passages", "40 Questions", "60 Minutes"],
    },
    {
      title: "WRITING TEST",
      description:
        "2 writing tasks including report writing and essay composition. 60 minutes.",
      icon: PenLine,
      href: "/writing",
      badges: ["2 Tasks", "400+ Words", "60 Minutes"],
    },
    {
      title: "LISTENING TEST",
      description:
        "4 sections with audio playback, 40 questions across 6 question types. 30 minutes.",
      icon: Headphones,
      href: "/listening",
      badges: ["4 Sections", "40 Questions", "30 Minutes"],
    },
    {
      title: "SPEAKING TEST",
      description:
        "AI-powered conversational exam with 3 parts. Real-time voice interaction. 11-14 minutes.",
      icon: Mic,
      href: "/speaking",
      badges: ["3 Parts", "AI Examiner", "14 Minutes"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfd] dark:bg-background">
      <Navbar />

      <main className="flex-1 py-10 md:py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-10 space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
              SELECT TEST MODULE
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Choose a module to begin your IELTS practice session.
            </p>
          </div>

          {/* Admin Control Center (Shown ONLY to Admin users) */}
          {isAdmin && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Control Center
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/admin/settings"
                  className="group bg-gradient-to-br from-sky-50/70 to-blue-50/40 dark:from-sky-950/30 dark:to-blue-950/20 border border-sky-200/80 dark:border-sky-800/80 rounded-[24px] p-5 hover:border-sky-400 dark:hover:border-sky-600 transition-all flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-md">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                        System & AI Settings
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Configure Groq API keys, LLM parameters & test generation switches
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-sky-500 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/admin/upload"
                  className="group bg-gradient-to-br from-indigo-50/70 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/80 rounded-[24px] p-5 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                        Upload Task 1 Charts
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Upload IELTS chart images & data to Cloudinary & DB
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* 2x2 Test Modules Grid */}
          <div id="test-modules" className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 scroll-mt-24">
            {testModules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link
                  href={module.href}
                  className="group bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] md:rounded-[28px] p-6 md:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800 transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Top Row: Icon + Arrow */}
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-500 dark:text-sky-400 shadow-sm">
                        <module.icon className="h-4.5 w-4.5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-sm md:text-base font-black tracking-wide text-slate-900 dark:text-slate-100 uppercase mt-4 mb-2">
                      {module.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                      {module.description}
                    </p>
                  </div>

                  {/* Bottom Pill Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {module.badges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-2.5 py-1 text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800 rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
