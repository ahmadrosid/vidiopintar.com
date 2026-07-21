"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicQuizQuestion, RevealedQuizQuestion } from "@/lib/quiz/types";
import { CheckCircle2, XCircle, Play } from "lucide-react";
import { useVideoStore } from "@/stores/video-store";

type QuizQuestionProps = {
  question: PublicQuizQuestion | RevealedQuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
  selectedIndex?: number | null;
  showFeedback?: boolean;
  nextLabel: string;
  onNext?: () => void;
  seekLabel: string;
};

function isRevealed(
  question: PublicQuizQuestion | RevealedQuizQuestion,
): question is RevealedQuizQuestion {
  return "correctIndex" in question;
}

export function QuizQuestionView({
  question,
  questionNumber,
  totalQuestions,
  onSelect,
  disabled = false,
  selectedIndex = null,
  showFeedback = false,
  nextLabel,
  onNext,
  seekLabel,
}: QuizQuestionProps) {
  const seekAndPlay = useVideoStore((state) => state.seekAndPlay);
  const revealed = showFeedback && isRevealed(question);

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Question {questionNumber} of {totalQuestions}
      </div>
      <p className="text-base font-semibold leading-relaxed text-foreground">
        {question.prompt}
      </p>

      <div className="flex flex-col gap-2">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = revealed && index === question.correctIndex;
          const isWrong = revealed && isSelected && !question.isCorrect;

          return (
            <button
              key={index}
              type="button"
              disabled={disabled || showFeedback}
              onClick={() => onSelect(index)}
              className={cn(
                "rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                isSelected && !showFeedback && "border-primary bg-primary/5",
                isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/20",
                isWrong && "border-red-500 bg-red-50 dark:bg-red-950/20",
                !isSelected && !showFeedback && "hover:border-primary/40",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div
          className={cn(
            "rounded-lg border p-4",
            question.isCorrect
              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
              : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20",
          )}
        >
          <div className="mb-2 flex items-center gap-2 font-medium">
            {question.isCorrect ? (
              <>
                <CheckCircle2 className="size-4 text-green-600" />
                Correct
              </>
            ) : (
              <>
                <XCircle className="size-4 text-red-600" />
                Not quite
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
          {question.timestampSeconds != null && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => seekAndPlay(question.timestampSeconds!)}
            >
              <Play className="mr-2 size-4" />
              {seekLabel}
            </Button>
          )}
        </div>
      )}

      {showFeedback && onNext && (
        <div className="pt-2">
          <Button className="w-full" onClick={onNext}>
            {nextLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
