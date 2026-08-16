"use client";

import type { ListeningQuestion } from "@/lib/listening-types";
import { CheckCircle2, FileText, AlignLeft, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";

interface QuestionCardProps {
  question: ListeningQuestion;
  userAnswer: string;
  onChangeAnswer: (answer: string) => void;
}

export function QuestionCard({
  question,
  userAnswer,
  onChangeAnswer,
}: QuestionCardProps) {
  const normType = (question.type || "").toLowerCase().replace(/[\s_-]+/g, "_");
  const isMCQ = normType === "mcq" || normType === "multiple_choice";
  const isMatching = normType === "matching";
  const isTextInput = !isMCQ && !isMatching;

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "mcq":
      case "multiple_choice":
        return "Multiple Choice";
      case "sentence_completion":
      case "completion":
        return "Sentence Completion";
      case "matching":
        return "Matching";
      case "short_answer":
        return "Short Answer";
      default:
        return "Sentence Completion";
    }
  };

  return (
    <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/60 rounded-[24px] p-6 sm:p-7 shadow-sm space-y-5 h-full flex flex-col justify-start">
      {/* Header Row: Question Number + Question Type Pill */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
          {question.index}
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800">
          <PenLine className="w-3.5 h-3.5 text-amber-500" />
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
        {isMCQ && (
          <div className="space-y-3">
            {(question.options || ["A", "B", "C", "D"]).map((opt, i) => {
              const match = opt.match(/^([A-D])[\.\s\):]/i);
              const letter = match ? match[1].toUpperCase() : String.fromCharCode(65 + i);
              const textOnly = match ? opt.replace(/^([A-D])[\.\s\):]\s*/i, "") : opt;
              const isSelected =
                userAnswer.trim().toUpperCase() === letter || userAnswer.trim() === opt.trim();

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

        {/* ── Matching ── */}
        {isMatching && (
          <div className="space-y-2.5">
            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Select match option:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(question.options || ["A", "B", "C", "D", "E"]).map((opt, i) => {
                const match = opt.match(/^([A-G])[\.\s\):]/i);
                const letter = match ? match[1].toUpperCase() : String.fromCharCode(65 + i);
                const textOnly = match ? opt.replace(/^([A-G])[\.\s\):]\s*/i, "") : opt;
                const isSelected =
                  userAnswer.trim().toUpperCase() === letter || userAnswer.trim() === opt.trim();

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChangeAnswer(letter)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-sky-50/80 dark:bg-sky-950/40 border-sky-500 text-sky-950 dark:text-sky-100 shadow-sm"
                        : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-sky-300 hover:bg-sky-50/30"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                        isSelected
                          ? "bg-[#0284c7] text-white border-[#0284c7]"
                          : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="truncate">{textOnly}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Sentence Completion, Short Answer & TextInput (with Preview Bubble) ── */}
        {isTextInput && (
          <div className="space-y-4">
            {/* Question sentence preview box */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
              {question.text}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Fill in the blank
              </label>
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => onChangeAnswer(e.target.value)}
                className="h-12 rounded-2xl border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-sm px-4 focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:border-sky-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
