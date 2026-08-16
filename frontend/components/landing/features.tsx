"use client";

import { motion } from "motion/react";
import { Mic, BookOpen, PenLine, Headphones, Play } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-12 md:py-18 bg-[#fbfcfd] dark:bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-16 space-y-3">
          <div className="inline-flex items-center justify-center">
            <span className="px-3.5 py-1 text-[11px] font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40">
              FEATURES
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[38px] font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
            EVERYTHING YOU NEED TO ACE IELTS
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Four comprehensive modules with AI-powered feedback, real exam conditions, and detailed analytics.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Feature Card 1: Speaking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] md:rounded-[28px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Icon & Badge */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
                  <Mic className="h-4 w-4 md:h-4.5 md:w-4.5" />
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full uppercase">
                  AI-POWERED
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base md:text-lg font-black tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-2">
                REAL-TIME AI SPEAKING EXAMINER
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                Practice with an AI that listens, responds, and evaluates your speaking performance with instant feedback on fluency, pronunciation, grammar, and vocabulary.
              </p>
            </div>

            {/* Mockup Preview Box */}
            <div className="border border-slate-200/80 dark:border-border/80 rounded-2xl p-4 bg-white dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <Mic className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">AI Examiner</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              </div>

              <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 dark:text-slate-400 font-normal">
                Tell me about your hometown.
              </div>

              {/* Sound Waveform Equalizer */}
              <div className="flex items-center justify-center gap-1 pt-1 h-5">
                <span className="w-1 h-2 bg-rose-400 rounded-full" />
                <span className="w-1 h-4 bg-rose-400 rounded-full" />
                <span className="w-1 h-5 bg-rose-400 rounded-full" />
                <span className="w-1 h-3 bg-rose-400 rounded-full" />
                <span className="w-1 h-4 bg-rose-400 rounded-full" />
                <span className="w-1 h-2 bg-rose-400 rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Feature Card 2: Reading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] md:rounded-[28px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Icon */}
              <div className="flex items-center mb-5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
                  <BookOpen className="h-4 w-4 md:h-4.5 md:w-4.5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base md:text-lg font-black tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-2">
                REAL EXAM READING INTERFACE
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                Timed passages with a split-panel view, multiple question types, and detailed answer review with analytics.
              </p>
            </div>

            {/* Mockup Preview Box */}
            <div className="border border-slate-200/80 dark:border-border/80 rounded-2xl p-4 bg-white dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <BookOpen className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Reading Test</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </div>
              </div>

              {/* Split View Content */}
              <div className="flex items-start justify-between gap-6 pt-1">
                {/* Passage Skeleton Lines */}
                <div className="space-y-1.5 flex-1">
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[90%]" />
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[70%]" />
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[85%]" />
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-1.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[8px] text-slate-500 dark:text-slate-400 font-medium">
                      A
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-sky-500 border border-sky-500 flex items-center justify-center text-[8px] text-white font-medium shadow-sm">
                      B
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[8px] text-slate-500 dark:text-slate-400 font-medium">
                      C
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Card 3: Writing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="group bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] md:rounded-[28px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Icon */}
              <div className="flex items-center mb-5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
                  <PenLine className="h-4 w-4 md:h-4.5 md:w-4.5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base md:text-lg font-black tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-2">
                SMART WRITING FEEDBACK
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                Write essays with real-time word count, structure guidance, formatting tools, and AI-powered evaluation.
              </p>
            </div>

            {/* Mockup Preview Box */}
            <div className="border border-slate-200/80 dark:border-border/80 rounded-2xl p-4 bg-white dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <PenLine className="h-3 w-3" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Writing Editor</span>
              </div>

              {/* Essay Skeleton Lines */}
              <div className="space-y-1.5 pt-1">
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[92%]" />
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[78%]" />
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[88%]" />
              </div>

              {/* Bottom Metrics Bar */}
              <div className="flex items-center justify-between pt-1">
                <span className="px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800 rounded">
                  247 words
                </span>
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[65%] h-full bg-sky-500 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature Card 4: Listening */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="group bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] md:rounded-[28px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Icon */}
              <div className="flex items-center mb-5">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-sm">
                  <Headphones className="h-4 w-4 md:h-4.5 md:w-4.5" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base md:text-lg font-black tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-2">
                INTERACTIVE LISTENING PRACTICE
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6">
                Answer questions while listening to real exam-style recordings with a custom audio player and transcription.
              </p>
            </div>

            {/* Mockup Preview Box */}
            <div className="border border-slate-200/80 dark:border-border/80 rounded-2xl p-4 bg-white dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Headphones className="h-3 w-3" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Listening</span>
              </div>

              {/* Audio Player Track */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  aria-label="Play sample audio"
                  className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-sm hover:bg-sky-600 transition-colors shrink-0"
                >
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </button>
                <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[38%] h-full bg-sky-500 rounded-full" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  2:14
                </span>
              </div>

              {/* Sound Waveform Equalizer */}
              <div className="flex items-center justify-center gap-1 pt-1 h-4">
                <span className="w-0.5 h-1.5 bg-sky-400 rounded-full" />
                <span className="w-0.5 h-3 bg-sky-400 rounded-full" />
                <span className="w-0.5 h-2 bg-sky-400 rounded-full" />
                <span className="w-0.5 h-1 bg-sky-400 rounded-full" />
                <span className="w-0.5 h-2.5 bg-sky-400 rounded-full" />
                <span className="w-0.5 h-3.5 bg-sky-400 rounded-full" />
                <span className="w-0.5 h-2 bg-sky-400 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

