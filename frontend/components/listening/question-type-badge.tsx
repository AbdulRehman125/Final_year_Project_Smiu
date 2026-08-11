"use client";

import { AlertCircle, CheckCircle, HelpCircle, FileText, List, Map } from "lucide-react";
import type { ListeningQuestionType } from "@/lib/listening-types";

interface QuestionTypeBadgeProps {
  type: ListeningQuestionType | string;
}

export function QuestionTypeBadge({ type }: QuestionTypeBadgeProps) {
  let label = "Question";
  let icon = <HelpCircle className="w-3.5 h-3.5" />;
  let colorClass = "bg-muted text-muted-foreground border-border";

  switch (type) {
    case "mcq":
      label = "Multiple Choice";
      icon = <List className="w-3.5 h-3.5" />;
      colorClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      break;
    case "matching":
      label = "Matching";
      icon = <CheckCircle className="w-3.5 h-3.5" />;
      colorClass = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      break;
    case "map_completion":
    case "plan_completion":
    case "diagram_completion":
      label = "Map / Diagram Completion";
      icon = <Map className="w-3.5 h-3.5" />;
      colorClass = "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      break;
    case "sentence_completion":
    case "form_completion":
    case "note_completion":
    case "table_completion":
    case "flowchart_completion":
    case "summary_completion":
    case "short_answer":
      label = "Completion";
      icon = <FileText className="w-3.5 h-3.5" />;
      colorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      break;
    default:
      label = type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      break;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${colorClass}`}
    >
      {icon}
      {label}
    </div>
  );
}
