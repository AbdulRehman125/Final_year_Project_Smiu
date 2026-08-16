"use client";

import { motion } from "motion/react";
import { FileText, Brain, TrendingUp } from "lucide-react";

export function Steps() {
  const steps = [
    {
      number: "01",
      stepLabel: "STEP 01",
      title: "TAKE A FULL MOCK TEST",
      description:
        "Choose any module and complete a full practice test under real exam conditions with timed sessions.",
      icon: FileText,
      iconBg: "bg-sky-50 dark:bg-sky-950/60 border-sky-100 dark:border-sky-800 text-sky-500 dark:text-sky-400",
    },
    {
      number: "02",
      stepLabel: "STEP 02",
      title: "GET INSTANT AI FEEDBACK",
      description:
        "Receive detailed band scores, criteria breakdowns, and personalized recommendations powered by AI.",
      icon: Brain,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-800 text-emerald-500 dark:text-emerald-400",
    },
    {
      number: "03",
      stepLabel: "STEP 03",
      title: "IMPROVE YOUR BAND SCORE",
      description:
        "Track your progress over time, focus on weak areas, and watch your scores improve with consistent practice.",
      icon: TrendingUp,
      iconBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-800 text-amber-500 dark:text-amber-400",
    },
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-18 bg-[#fbfcfd] dark:bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 space-y-3">
          <div className="inline-flex items-center justify-center">
            <span className="px-3.5 py-1 text-[11px] font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase rounded-full border border-amber-200/80 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40">
              HOW IT WORKS
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[38px] font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">
            THREE STEPS TO YOUR TARGET SCORE
          </h2>
        </div>

        {/* 3-Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.15 }}
              className="relative group bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] md:rounded-[28px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Huge Background Watermark Number */}
              <span className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-100/90 dark:text-slate-800/40 select-none absolute top-4 right-6 pointer-events-none tracking-tighter leading-none">
                {step.number}
              </span>

              <div>
                {/* Step Icon */}
                <div
                  className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-sm relative z-10 ${step.iconBg}`}
                >
                  <step.icon className="h-5 w-5" />
                </div>

                {/* Step Label */}
                <div className="text-[10px] md:text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mt-8 mb-2">
                  {step.stepLabel}
                </div>

                {/* Step Title */}
                <h3 className="text-base md:text-[17px] font-black tracking-wide text-slate-900 dark:text-slate-100 uppercase mb-3">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

