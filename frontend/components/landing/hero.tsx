"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Star,
  BookOpen,
  PenLine,
  Mic,
  Headphones,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fbfcfd] dark:bg-background pt-8 pb-16 ">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* ========================================================================= */}
          {/* Left Column: Headline, Copy, CTAs, Social Proof */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Top Pill Badge */}
            <div className="inline-flex items-center">
              <span className="px-3.5 py-1 text-[11px] font-bold tracking-wider text-sky-600 dark:text-sky-400 uppercase rounded-full border border-sky-200/80 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 inline-flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-sky-500" />
                AI-Powered IELTS Preparation
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase leading-[1.06]">
              MASTER IELTS <br />
              <span className="text-[#0284c7]">WITH AI-POWERED</span> <br />
              PRACTICE
            </h1>

            {/* Description Subtext */}
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-lg">
              Experience real exam conditions with intelligent feedback for Reading, Writing, Listening, and Speaking. Practice with an AI examiner that listens, responds, and scores your performance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-full shadow-[0_4px_14px_rgba(2,132,199,0.3)] transition-all hover:shadow-lg"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>

              {/* <Link
                href="/reading"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm px-5 py-3 rounded-full border border-slate-200/70 dark:border-slate-700 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-current text-slate-500 dark:text-slate-400" />
                Try Demo
              </Link> */}
            </div>

            {/* Demo Note */}
            {/* <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              Take a demo test. Get your full report by verifying your email.
            </p> */}

            {/* Social Proof & Rating */}
            {/* <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-900 shadow-sm">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-900 shadow-sm">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8 border-2 border-white dark:border-slate-900 shadow-sm">
                  <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-950/80 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-sky-700 dark:text-sky-300 shadow-sm">
                  +2k
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Trusted by students preparing worldwide
                </span>
              </div>
            </div> */}
          </motion.div>

          {/* ========================================================================= */}
          {/* Right Column: 4 Floating UI Preview Cards */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 relative">
            {/* Subtle soft glow background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-sky-200/40 dark:bg-sky-900/20 blur-[100px] rounded-full pointer-events-none" />

            {/* 2x2 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Card 1: Reading Test (Top Left) */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/95 dark:bg-card/95 backdrop-blur border border-slate-200/80 dark:border-border/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <BookOpen className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Reading Test
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </div>
                </div>

                {/* Split View Mockup */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  {/* Left: Skeleton Lines */}
                  <div className="space-y-1.5 flex-1">
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-[90%]" />
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-[70%]" />
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-[85%]" />
                  </div>

                  {/* Right: Radio Options */}
                  <div className="space-y-1 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[7px] text-slate-400">
                        A
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-500 flex items-center justify-center text-[7px] text-white font-medium">
                        B
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[7px] text-slate-400">
                        C
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Writing Editor (Top Right) */}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="bg-white/95 dark:bg-card/95 backdrop-blur border border-slate-200/80 dark:border-border/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3 sm:translate-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <PenLine className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Writing Editor
                  </span>
                </div>

                {/* Essay Skeleton */}
                <div className="space-y-1.5 pt-1">
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-[92%]" />
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-[78%]" />
                  <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full w-[88%]" />
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="px-2 py-0.5 text-[9px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800 rounded">
                    247 words
                  </span>
                  <div className="w-14 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[65%] h-full bg-sky-500 rounded-full" />
                  </div>
                </div>
              </motion.div>

              {/* Card 3: AI Examiner (Bottom Left) */}
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="bg-white/95 dark:bg-card/95 backdrop-blur border border-slate-200/80 dark:border-border/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <Mic className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      AI Examiner
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </div>
                </div>

                <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-400 dark:text-slate-400">
                  Tell me about your hometown.
                </div>

                {/* Sound Wave Equalizer */}
                <div className="flex items-center justify-center gap-1 pt-1 h-4">
                  <span className="w-1 h-2 bg-rose-400 rounded-full" />
                  <span className="w-1 h-3.5 bg-rose-400 rounded-full" />
                  <span className="w-1 h-4.5 bg-rose-400 rounded-full" />
                  <span className="w-1 h-2.5 bg-rose-400 rounded-full" />
                  <span className="w-1 h-3.5 bg-rose-400 rounded-full" />
                  <span className="w-1 h-1.5 bg-rose-400 rounded-full" />
                </div>
              </motion.div>

              {/* Card 4: Listening (Bottom Right) */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
                className="bg-white/95 dark:bg-card/95 backdrop-blur border border-slate-200/80 dark:border-border/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none space-y-3 sm:translate-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Headphones className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Listening
                  </span>
                </div>

                {/* Audio Track */}
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    aria-label="Play audio"
                    className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-sm shrink-0"
                  >
                    <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                  </button>
                  <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-[38%] h-full bg-sky-500 rounded-full" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono shrink-0">
                    2:14
                  </span>
                </div>

                {/* Equalizer */}
                <div className="flex items-center justify-center gap-1 pt-1 h-3.5">
                  <span className="w-0.5 h-1.5 bg-sky-400 rounded-full" />
                  <span className="w-0.5 h-3 bg-sky-400 rounded-full" />
                  <span className="w-0.5 h-2 bg-sky-400 rounded-full" />
                  <span className="w-0.5 h-1 bg-sky-400 rounded-full" />
                  <span className="w-0.5 h-2.5 bg-sky-400 rounded-full" />
                  <span className="w-0.5 h-3.5 bg-sky-400 rounded-full" />
                  <span className="w-0.5 h-2 bg-sky-400 rounded-full" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
