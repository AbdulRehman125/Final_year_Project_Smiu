"use client";

import type { ReadingQuestion } from "@/lib/reading-types";
import { CheckCircle2, FileText, AlignLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface QuestionCardProps {
  question: ReadingQuestion;
  userAnswer: string;
  onChangeAnswer: (answer: string) => void;
  paragraphsCount?: number;
}

export function QuestionCard({
  question,
  userAnswer,
  onChangeAnswer,
  paragraphsCount = 6,
}: QuestionCardProps) {
  const paragraphOptions = Array.from({ length: paragraphsCount }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "mcq":
        return "Multiple Choice";
      case "true_false_not_given":
        return "True / False / Not Given";
      case "matching_headings":
        return "Matching Headings";
      case "sentence_completion":
        return "Sentence Completion";
      case "short_answer":
        return "Short Answer";
      default:
        return "Question";
    }
  };

  return (
    <div className="bg-white overflow-y-auto dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 sm:p-7 shadow-sm space-y-5 h-full flex flex-col justify-start">
      {/* Header Row: Question Number + Question Type Pill */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
          {question.index}
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
          {getQuestionTypeLabel(question.type)}
        </span>
      </div>

      {/* Question Prompt */}
      <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
        {question.text}
      </p>

      {/* Answer inputs according to type */}
      <div className="pt-1 flex-1">
        {/* ── Multiple Choice ── */}
        {question.type === "mcq" && (
          <div className="space-y-3">
            {(question.options || ["A", "B", "C", "D"]).map((opt, i) => {
              const match = opt.match(/^([A-D])[\.\s\):]/i);
              const letter = match ? match[1].toUpperCase() : String.fromCharCode(65 + i);
              const textOnly = match ? opt.replace(/^([A-D])[\.\s\):]\s*/i, "") : opt;
              const isSelected = userAnswer.trim().toUpperCase() === letter || userAnswer.trim() === opt.trim();

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangeAnswer(letter)}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 text-sky-950 dark:text-sky-100 shadow-sm"
                      : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-sky-300 hover:bg-sky-50/30"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors border ${
                      isSelected
                        ? "bg-[#0284c7] text-white border-[#0284c7]"
                        : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1">{textOnly}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── True / False / Not Given ── */}
        {question.type === "true_false_not_given" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {["TRUE", "FALSE", "NOT GIVEN"].map((val) => {
              const isSelected = userAnswer.toUpperCase() === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChangeAnswer(val)}
                  className={`flex items-center justify-center p-4 rounded-2xl border text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 text-sky-950 dark:text-sky-100 shadow-sm"
                      : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-sky-300 hover:bg-sky-50/30"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Matching Headings (Paragraph selection) ── */}
        {question.type === "matching_headings" && (
          <div className="space-y-3">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Select matching paragraph:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {paragraphOptions.map((label) => {
                const isSelected = userAnswer.toUpperCase() === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onChangeAnswer(label)}
                    className={`h-12 rounded-2xl border text-sm font-bold flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? "bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 text-sky-950 dark:text-sky-100 shadow-sm"
                        : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-sky-300 hover:bg-sky-50/30"
                    }`}
                  >
                    <span>{label}</span>
                    <span className="text-[9px] font-normal text-slate-400">Para</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Sentence Completion & Short Answer ── */}
        {(question.type === "sentence_completion" || question.type === "short_answer") && (
          <div className="space-y-2.5">
            <label className="text-xs text-slate-400 font-medium block">
              Type your answer below:
            </label>
            <Input
              type="text"
              placeholder="e.g. artificial intelligence"
              value={userAnswer}
              onChange={(e) => onChangeAnswer(e.target.value)}
              className="h-12 rounded-2xl border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-sm px-4 focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
