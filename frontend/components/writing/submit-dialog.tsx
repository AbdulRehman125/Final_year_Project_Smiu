"use client"

// components/writing/submit-dialog.tsx

import { AlertTriangle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SubmitDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  task1Words: number
  task2Words: number
}

export function SubmitDialog({ open, onClose, onConfirm, task1Words, task2Words }: SubmitDialogProps) {
  if (!open) return null

  const t1Warning = task1Words < 150
  const t2Warning = task2Words < 250

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-lg font-bold text-foreground mb-1">Submit Test?</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Once submitted, you cannot make changes.
        </p>

        {/* Word count summary */}
        <div className="bg-muted rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Task 1</span>
            <span className={task1Words >= 150 ? "text-emerald-500 font-medium" : "text-amber-500 font-medium"}>
              {task1Words} words {task1Words < 150 ? `(need ${150 - task1Words} more)` : "✓"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Task 2</span>
            <span className={task2Words >= 250 ? "text-emerald-500 font-medium" : "text-amber-500 font-medium"}>
              {task2Words} words {task2Words < 250 ? `(need ${250 - task2Words} more)` : "✓"}
            </span>
          </div>
        </div>

        {/* Warning */}
        {(t1Warning || t2Warning) && (
          <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {t1Warning && t2Warning
                ? "Both tasks are under the minimum word count."
                : t1Warning
                ? "Task 1 is under 150 words."
                : "Task 2 is under 250 words."}{" "}
              This will cap your Task Achievement score at Band 5.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1 rounded-xl gap-2" onClick={onConfirm}>
            <Send className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
