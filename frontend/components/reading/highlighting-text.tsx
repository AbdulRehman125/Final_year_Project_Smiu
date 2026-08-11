"use client";

import { useState } from "react";

interface HighlightingTextProps {
  text: string;
  enabled: boolean;
}

export function HighlightingText({ text, enabled }: HighlightingTextProps) {
  const [highlights, setHighlights] = useState<[number, number][]>([]);

  const handleMouseUp = () => {
    if (!enabled) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const start = text.indexOf(selectedText);
    if (start !== -1) {
      const end = start + selectedText.length;
      setHighlights((prev) => [...prev, [start, end]]);
      selection.removeAllRanges();
    }
  };

  if (highlights.length === 0) {
    return <p onMouseUp={handleMouseUp}>{text}</p>;
  }

  // Sort and render text with highlight spans
  const sorted = [...highlights].sort((a, b) => a[0] - b[0]);
  const parts = [];
  let lastIdx = 0;

  sorted.forEach(([start, end], i) => {
    if (start > lastIdx) {
      parts.push(text.slice(lastIdx, start));
    }
    parts.push(
      <mark key={i} className="bg-amber-300 dark:bg-amber-500/40 text-inherit rounded px-0.5">
        {text.slice(start, end)}
      </mark>
    );
    lastIdx = Math.max(lastIdx, end);
  });

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return <p onMouseUp={handleMouseUp}>{parts}</p>;
}
