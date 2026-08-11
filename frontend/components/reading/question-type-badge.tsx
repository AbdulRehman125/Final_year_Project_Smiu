"use client";

import { CheckCircle2, HelpCircle, FileText, ListOrdered, MessageSquare } from "lucide-react";
import type { QuestionType } from "@/lib/reading-types";

interface QuestionTypeBadgeProps {
  type: QuestionType | string;
}

export function QuestionTypeBadge({ type }: QuestionTypeBadgeProps) {
  const configs: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
    mcq: {
      label: "Multiple Choice",
      icon: CheckCircle2,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    true_false_not_given: {
      label: "True / False / Not Given",
      icon: HelpCircle,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    sentence_completion: {
      label: "Sentence Completion",
      icon: FileText,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    short_answer: {
      label: "Short Answer",
      icon: MessageSquare,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    matching_headings: {
      label: "Matching Headings",
      icon: ListOrdered,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    },
  };

  const cfg = configs[type] || {
    label: type.replace(/_/g, " ").toUpperCase(),
    icon: HelpCircle,
    color: "bg-muted text-muted-foreground border-border",
  };

  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}
