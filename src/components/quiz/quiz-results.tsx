"use client";

import { Button } from "@/components/ui/button";
import type { RevealedQuizQuestion } from "@/lib/quiz/types";
import { Play } from "lucide-react";
import { useVideoStore } from "@/stores/video-store";

type QuizResultsProps = {
  score: number;
  total: number;
  wrongQuestions: RevealedQuizQuestion[];
  onRetry: () => void;
  onGenerateNew?: () => void;
  retryLabel: string;
  retryWithProLabel: string;
  generateNewLabel: string;
  title: string;
  reviewTitle: string;
  seekLabel: string;
  upgradeRequired: boolean;
  canRetry: boolean;
  canGenerate: boolean;
  onUpgrade: () => void;
};

export function QuizResultsView({
  score,
  total,
  wrongQuestions,
  onRetry,
  onGenerateNew,
  retryLabel,
  retryWithProLabel,
  generateNewLabel,
  title,
  reviewTitle,
  seekLabel,
  upgradeRequired,
  canRetry,
  canGenerate,
  onUpgrade,
}: QuizResultsProps) {
  const seekAndPlay = useVideoStore((state) => state.seekAndPlay);

  const handleRetry = () => {
    if (!canRetry || upgradeRequired) {
      onUpgrade();
      return;
    }
    onRetry();
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
      <div className="rounded-xl border bg-muted/30 p-5 text-center">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">
          {score}/{total}
        </p>
      </div>

      {wrongQuestions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">{reviewTitle}</h3>
          {wrongQuestions.map((question, index) => (
            <div key={index} className="rounded-lg border p-4">
              <p className="font-medium">{question.prompt}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {question.explanation}
              </p>
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
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Perfect score — nice work.
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Button className="w-full" onClick={handleRetry}>
          {!canRetry || upgradeRequired ? retryWithProLabel : retryLabel}
        </Button>
        {onGenerateNew && canGenerate && (
          <Button variant="outline" className="w-full" onClick={onGenerateNew}>
            {generateNewLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
