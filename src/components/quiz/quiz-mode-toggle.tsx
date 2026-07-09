"use client";

import { cn } from "@/lib/utils";

export type PanelMode = "chat" | "quiz";

interface QuizModeToggleProps {
  mode: PanelMode;
  onModeChange: (mode: PanelMode) => void;
  disabled?: boolean;
  chatLabel: string;
  quizLabel: string;
}

export function QuizModeToggle({
  mode,
  onModeChange,
  disabled = false,
  chatLabel,
  quizLabel,
}: QuizModeToggleProps) {
  return (
    <div className="mb-3 flex rounded-lg border bg-muted/40 p-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onModeChange("chat")}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          mode === "chat"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {chatLabel}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onModeChange("quiz")}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          mode === "quiz"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {quizLabel}
      </button>
    </div>
  );
}
