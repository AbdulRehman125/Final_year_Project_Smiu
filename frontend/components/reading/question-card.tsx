"use client";

import type { ReadingQuestion } from "@/lib/reading-types";
import { QuestionTypeBadge } from "./question-type-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        {question.type === "mcq" && (
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
                  className={`flex items-center justify-center px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "bg-background border-border text-foreground hover:bg-muted/40"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Sentence Completion & Short Answer ── */}
        {(question.type === "sentence_completion" || question.type === "short_answer") && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Type your answer below:</Label>
            <Input
              value={userAnswer}
              onChange={(e) => onChangeAnswer(e.target.value)}
              placeholder="e.g. artificial intelligence"
              className="h-12 text-base rounded-xl bg-background border-border focus-visible:ring-primary"
            />
          </div>
        )}

        {/* ── Matching Headings ── */}
        {question.type === "matching_headings" && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Select Paragraph:</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {paragraphOptions.map((letter) => {
                const isSelected = userAnswer === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => onChangeAnswer(letter)}
                    className={`h-11 rounded-xl border text-sm font-bold flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted/40"
                    }`}
                  >
                    Paragraph {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
