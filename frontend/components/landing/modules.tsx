"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  BookOpen,
  PenLine,
  Mic,
  Headphones,
  FileText,
  CheckSquare,
  Clock,
  BarChart2,
  CheckCircle2,
  Cloud,
  BarChart3,
  MessageSquare,
  Activity,
  Award,
  Layers,
  Volume2,
  ArrowRight,
  Play,
} from "lucide-react";

export function Modules() {
  return (
    <section id="modules" className="py-12 md:py-18 bg-[#fbfcfd] dark:bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24 space-y-3">
          <div className="inline-flex items-center justify-center">
            <span className="px-3.5 py-1 text-[11px] font-bold tracking-widest text-sky-600 dark:text-sky-400 uppercase rounded-full border border-sky-200/80 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40">
              MODULES
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[38px] font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
            EXPLORE EACH TEST MODULE
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Each module is built to mirror the actual IELTS exam experience with interactive UI and AI evaluation.
          </p>
        </div>

        <div className="space-y-10 md:space-y-16">
          {/* ========================================================================= */}
          {/* MODULE 1: READING (Left Content, Right Mockup) */}
          {/* ========================================================================= */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Badge Row */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-full uppercase">
                  READING MODULE
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase mb-3">
                  FOCUSED READING PRACTICE
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
                  A split-panel interface with the passage on the left and questions on the right. Supports all five IELTS question types with a 60-minute countdown timer and progress tracking.
                </p>
              </div>

              {/* Bullet Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span>3 academic passages with scrollable views</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <CheckSquare className="h-3.5 w-3.5" />
                  </div>
                  <span>5 question types including matching & T/F/NG</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <span>60-minute countdown with progress indicator</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <BarChart2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Detailed results with band score breakdown</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/reading"
                  className="inline-flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(2,132,199,0.25)] transition-all hover:shadow-lg"
                >
                  Try Reading Test <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right Mockup Card */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] p-5 md:p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <BookOpen className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      IELTS Reading Test
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 rounded-full">
                    Part 1 of 3
                  </span>
                </div>

                {/* 2-Panel Split Mockup */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Left: Passage */}
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                        PASSAGE
                      </span>
                      <div className="space-y-2">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[94%]" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[82%]" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[90%]" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[75%]" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[88%]" />
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="w-[33%] h-full bg-sky-500 rounded-full" />
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                        33%
                      </span>
                    </div>
                  </div>

                  {/* Right: Questions */}
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                        QUESTIONS
                      </span>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[8px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
                            1
                          </span>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-medium shrink-0 shadow-sm">
                            2
                          </span>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[8px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
                            3
                          </span>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full flex-1" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[8px] text-slate-500 dark:text-slate-400 font-medium shrink-0">
                            4
                          </span>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full flex-1" />
                        </div>
                      </div>
                    </div>

                    {/* Countdown Timer Box */}
                    <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 rounded-xl py-1.5 px-3 flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>48:32 remaining</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* MODULE 2: WRITING (Left Mockup, Right Content) */}
          {/* ========================================================================= */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Mockup Card */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="order-2 lg:order-1"
            >
              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] p-5 md:p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <PenLine className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      IELTS Writing Editor
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                    Task 2
                  </span>
                </div>

                {/* 2-Panel Split Mockup */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Left: Task Prompt */}
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                      TASK PROMPT
                    </span>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[90%]" />
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[78%]" />
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[85%]" />
                  </div>

                  {/* Right: Rich Text Editor Area */}
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Mini Toolbar */}
                      <div className="flex items-center gap-1 mb-2.5 border-b border-slate-100 dark:border-slate-800 pb-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          B
                        </span>
                        <span className="px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                          I
                        </span>
                        <span className="px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                          U
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[94%]" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[88%]" />
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-[90%]" />
                      </div>
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[9px] font-medium text-sky-600 dark:text-sky-400">
                        267/250 words
                      </span>
                      <div className="flex gap-1">
                        <span className="w-2 h-1 bg-emerald-500 rounded-full" />
                        <span className="w-2 h-1 bg-emerald-500 rounded-full" />
                        <span className="w-2 h-1 bg-emerald-500 rounded-full" />
                        <span className="w-2 h-1 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="space-y-6 order-1 lg:order-2"
            >
              {/* Badge Row */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
                  <PenLine className="h-4 w-4" />
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-full uppercase">
                  WRITING MODULE
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase mb-3">
                  WRITE WITH CONFIDENCE
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
                  A two-panel layout with task prompts on the left and a rich text editor on the right. Includes real-time word count tracking, formatting tools, and auto-save.
                </p>
              </div>

              {/* Bullet Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span>Task 1 (report) & Task 2 (essay) with prompts</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Real-time word count with progress warnings</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <Cloud className="h-3.5 w-3.5" />
                  </div>
                  <span>Auto-save ensures you never lose your work</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <BarChart3 className="h-3.5 w-3.5" />
                  </div>
                  <span>AI scoring across all 4 IELTS writing criteria</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/writing"
                  className="inline-flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(2,132,199,0.25)] transition-all hover:shadow-lg"
                >
                  Try Writing Test <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* MODULE 3: SPEAKING (Left Content, Right Mockup) */}
          {/* ========================================================================= */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Badge Row */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
                  <Mic className="h-4 w-4" />
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-full uppercase">
                  AI-POWERED
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase mb-3">
                  SPEAK WITH AN AI EXAMINER
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
                  The most immersive IELTS speaking practice available. Have a real-time conversation with an AI examiner that asks follow-up questions and provides instant scoring.
                </p>
              </div>

              {/* Bullet Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <span>Natural turn-taking conversation flow</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <span>Voice recording with live waveform visualization</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <Award className="h-3.5 w-3.5" />
                  </div>
                  <span>Instant scoring: fluency, pronunciation, grammar, vocab</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <Layers className="h-3.5 w-3.5" />
                  </div>
                  <span>All 3 IELTS parts including cue card for Part 2</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/speaking/test"
                  className="inline-flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(2,132,199,0.25)] transition-all hover:shadow-lg"
                
                >
                  Try Speaking Test <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right Mockup Card */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] p-5 md:p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <Mic className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      AI Speaking Examiner
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </div>
                </div>

                {/* Conversation Bubbles */}
                <div className="space-y-3 pt-1">
                  {/* Examiner bubble */}
                  <div className="bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-600 dark:text-slate-300 max-w-[85%]">
                    Tell me about your hometown. What do you like most about living there?
                  </div>

                  {/* Candidate bubble */}
                  <div className="bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/80 rounded-2xl p-3 text-xs text-slate-700 dark:text-slate-200 max-w-[85%] ml-auto space-y-2">
                    <p>I come from a small city in southern China...</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        FLU
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        PRN
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        GRA
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        VOC
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sound Waveform Equalizer */}
                <div className="flex items-center justify-center gap-1 pt-2 h-5">
                  <span className="w-1 h-2 bg-rose-400 rounded-full" />
                  <span className="w-1 h-3.5 bg-rose-400 rounded-full" />
                  <span className="w-1 h-5 bg-rose-400 rounded-full" />
                  <span className="w-1 h-3 bg-rose-400 rounded-full" />
                  <span className="w-1 h-4 bg-rose-400 rounded-full" />
                  <span className="w-1 h-2 bg-rose-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* MODULE 4: LISTENING (Left Mockup, Right Content) */}
          {/* ========================================================================= */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Mockup Card */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="order-2 lg:order-1"
            >
              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] p-5 md:p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <Headphones className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      IELTS Listening Test
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-2.5 py-0.5 rounded-full">
                    Section 2
                  </span>
                </div>

                {/* Audio Player Component */}
                <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Play audio"
                      className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-sm shrink-0"
                    >
                      <Play className="h-3 w-3 fill-current ml-0.5" />
                    </button>

                    {/* Equalizer / Progress Bar */}
                    <div className="flex items-center gap-1 flex-1">
                      <span className="w-0.5 h-3 bg-sky-500 rounded-full" />
                      <span className="w-0.5 h-4 bg-sky-500 rounded-full" />
                      <span className="w-0.5 h-2 bg-sky-500 rounded-full" />
                      <span className="w-0.5 h-5 bg-sky-500 rounded-full" />
                      <span className="w-0.5 h-3 bg-sky-500 rounded-full" />
                      <span className="w-0.5 h-4 bg-slate-300 dark:bg-slate-600 rounded-full" />
                      <span className="w-0.5 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />
                      <span className="w-0.5 h-3 bg-slate-300 dark:bg-slate-600 rounded-full" />
                      <span className="w-0.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Volume2 className="h-3 w-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        1:24
                      </span>
                    </div>
                  </div>
                </div>

                {/* Question List Preview */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2">
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      11. The tour starts at the...
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                      bookshop
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2">
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      12. Visitors should bring...
                    </span>
                    <span className="w-16 h-4 rounded bg-slate-100 dark:bg-slate-700/60 border border-dashed border-slate-200 dark:border-slate-600" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className="space-y-6 order-1 lg:order-2"
            >
              {/* Badge Row */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-sm">
                  <Headphones className="h-4 w-4" />
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-full uppercase">
                  LISTENING MODULE
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase mb-3">
                  TRAIN YOUR LISTENING SKILLS
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
                  A custom audio player with simulated waveform, playback speed control, and volume adjustment. Supports all 6 IELTS listening question types across 4 sections.
                </p>
              </div>

              {/* Bullet Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <Volume2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Custom audio player with speed and volume controls</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <CheckSquare className="h-3.5 w-3.5" />
                  </div>
                  <span>6 question types: MCQ, matching, map, table, sentence, short answer</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <span>30-minute timed sessions with auto-progression</span>
                </div>
                <div className="flex items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-500 flex items-center justify-center shrink-0">
                    <BarChart2 className="h-3.5 w-3.5" />
                  </div>
                  <span>Section-by-section performance breakdown</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href="/listening"
                  className="inline-flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(2,132,199,0.25)] transition-all hover:shadow-lg"
                >
                  Try Listening Test <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
