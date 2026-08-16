"use client";

import { motion } from "motion/react";
import { BarChart3 } from "lucide-react";

export function ProgressTracking() {
  const features = [
    {
      title: "Band Scores",
      subtitle: "Per-module and overall",
    },
    {
      title: "Criteria Breakdown",
      subtitle: "Radar chart analysis",
    },
    {
      title: "Question Analytics",
      subtitle: "Type-by-type performance",
    },
    {
      title: "Recommendations",
      subtitle: "AI-generated study tips",
    },
  ];

  // Upward progression bars for the chart mockup
  const chartBars = [
    { height: 32, opacity: "bg-sky-300 dark:bg-sky-500/50" },
    { height: 44, opacity: "bg-sky-300 dark:bg-sky-500/50" },
    { height: 38, opacity: "bg-sky-400 dark:bg-sky-500/60" },
    { height: 52, opacity: "bg-sky-400 dark:bg-sky-500/70" },
    { height: 48, opacity: "bg-sky-400 dark:bg-sky-500/70" },
    { height: 60, opacity: "bg-sky-500 dark:bg-sky-500/80" },
    { height: 68, opacity: "bg-sky-500 dark:bg-sky-500/80" },
    { height: 64, opacity: "bg-sky-500 dark:bg-sky-500/90" },
    { height: 78, opacity: "bg-sky-500 dark:bg-sky-500" },
    { height: 74, opacity: "bg-sky-500 dark:bg-sky-500" },
    { height: 88, opacity: "bg-sky-600 dark:bg-sky-400" },
    { height: 95, opacity: "bg-sky-600 dark:bg-sky-400" },
  ];

  return (
    <section id="progress-tracking" className="py-12 md:py-18 bg-[#fbfcfd] dark:bg-background">
      <div className="container mx-auto px-4 md:px-6 ">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text & Feature Pill Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="inline-flex items-center">
              <span className="px-3.5 py-1 text-[11px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase rounded-full border border-emerald-200/80 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40">
                ANALYTICS
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-4xl lg:text-[38px] font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase leading-tight">
              TRACK YOUR PROGRESS LIKE A PRO
            </h2>

            {/* Description */}
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
              Every test generates a comprehensive results page with band scores, criteria breakdowns, question-type analysis, and personalized improvement recommendations.
            </p>

            {/* 2x2 Feature Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-lg pt-2">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80"
                >
                  <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Analytics Card Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[28px] md:rounded-[32px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-sm">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Your Progress
                </h3>
              </div>

              {/* 3 Metric Score Boxes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-2 text-center">
                  <span className="block text-xl md:text-2xl font-black text-emerald-500 dark:text-emerald-400">
                    7.5
                  </span>
                  <span className="block text-[10px] md:text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    Overall
                  </span>
                </div>
                <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-2 text-center">
                  <span className="block text-xl md:text-2xl font-black text-sky-500 dark:text-sky-400">
                    8.0
                  </span>
                  <span className="block text-[10px] md:text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    Reading
                  </span>
                </div>
                <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-2 text-center">
                  <span className="block text-xl md:text-2xl font-black text-sky-500 dark:text-sky-400">
                    7.0
                  </span>
                  <span className="block text-[10px] md:text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                    Writing
                  </span>
                </div>
              </div>

              {/* Ascending Bar Chart Box */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 relative">
                {/* Visualizer Bars */}
                <div className="flex items-end justify-center gap-1.5 md:gap-2 h-20 md:h-24 pt-2">
                  {chartBars.map((bar, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${bar.height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                      className={`w-2 md:w-2.5 rounded-t-sm ${bar.opacity}`}
                    />
                  ))}
                </div>

                {/* Subtitle Indicator */}
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 text-center mt-2">
                  +1.5 bands
                </div>

                {/* Axis Labels */}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 absolute bottom-3 left-4">
                  Jan
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 absolute bottom-3 right-4">
                  Dec
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

