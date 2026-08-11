"use client";

import type { ListeningQuestion } from "@/lib/listening-types";
import { QuestionTypeBadge } from "./question-type-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            {question.index}
          </div>
          <QuestionTypeBadge type={question.type} />
        </div>
      </div>

      {/* Stem text */}
      <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
        {question.text}
      </p>

      {/* Answer inputs according to type */}
      <div className="pt-2">
        {/* ── Multiple Choice ── */}
        {isMCQ && (
          <div className="space-y-2.5">
            {(question.options || ["A", "B", "C", "D"]).map((opt, i) => {
              const match = opt.match(/^([A-D])[\.\s\):]/i);
              const letter = match ? match[1].toUpperCase() : String.fromCharCode(65 + i);
              const isSelected = userAnswer.trim().toUpperCase() === letter || userAnswer.trim() === opt.trim();

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangeAnswer(letter)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-background border-border text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Matching ── */}
        {isMatching && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Select Match Option:</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(question.options || ["A", "B", "C", "D", "E"]).map((opt, i) => {
                const match = opt.match(/^([A-G])[\.\s\):]/i);
                const letter = match ? match[1].toUpperCase() : String.fromCharCode(65 + i);
                const isSelected = userAnswer.trim().toUpperCase() === letter || userAnswer.trim() === opt.trim();

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChangeAnswer(letter)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="truncate">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Sentence Completion, Short Answer & All Other Text Inputs ── */}
        {isTextInput && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Type your answer below:</Label>
            <Input
              value={userAnswer}
              onChange={(e) => onChangeAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="h-12 text-base rounded-xl bg-background border-border focus-visible:ring-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}

