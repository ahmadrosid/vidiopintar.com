"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { QuizQuestionView } from "@/components/quiz/quiz-question";
import { QuizResultsView } from "@/components/quiz/quiz-results";
import type { PublicQuizQuestion, RevealedQuizQuestion } from "@/lib/quiz/types";

export type QuizEntitlements = {
  currentPlan: "free" | "monthly" | "yearly";
  canGenerate: boolean;
  canRetry: boolean;
  upgradeRequired: boolean;
  trialUsed: boolean;
  hasCompletedAttempt: boolean;
};

export type QuizState = {
  quizId: number;
  attemptId: number;
  status: "in_progress" | "completed";
  currentIndex: number;
  score: number | null;
  questions: Array<PublicQuizQuestion | RevealedQuizQuestion>;
};

type UseQuizOptions = {
  videoId: string;
  enabled: boolean;
};

export function useQuiz({ videoId, enabled }: UseQuizOptions) {
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [entitlements, setEntitlements] = useState<QuizEntitlements | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFeedbackIndex, setPendingFeedbackIndex] = useState<number | null>(
    null,
  );

  const fetchQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/video/${videoId}/quiz`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load quiz");
      }
      setQuiz(data.quiz ?? null);
      setEntitlements(data.entitlements ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (enabled) {
      fetchQuiz();
    }
  }, [enabled, fetchQuiz]);

  const generateQuiz = useCallback(
    async (regenerate = false) => {
      setIsGenerating(true);
      setError(null);
      setPendingFeedbackIndex(null);
      try {
        const response = await fetch(`/api/video/${videoId}/quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regenerate }),
        });
        const data = await response.json();
        if (!response.ok) {
          if (data.error === "upgrade_required") {
            setEntitlements(data.entitlements ?? entitlements);
            setError("upgrade_required");
            return;
          }
          throw new Error(data.error || "Failed to generate quiz");
        }
        setQuiz(data.quiz);
        setEntitlements(data.entitlements);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate quiz");
      } finally {
        setIsGenerating(false);
      }
    },
    [videoId, entitlements],
  );

  const submitAnswer = useCallback(
    async (questionIndex: number, selectedIndex: number) => {
      if (!quiz) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const response = await fetch(`/api/video/${videoId}/quiz/attempt`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attemptId: quiz.attemptId,
            questionIndex,
            selectedIndex,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to submit answer");
        }
        setQuiz(data.quiz);
        setEntitlements(data.entitlements);
        setPendingFeedbackIndex(questionIndex);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit answer");
      } finally {
        setIsSubmitting(false);
      }
    },
    [quiz, videoId],
  );

  const retryQuiz = useCallback(async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    setError(null);
    setPendingFeedbackIndex(null);
    try {
      const response = await fetch(`/api/video/${videoId}/quiz/attempt`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.error === "upgrade_required") {
          setEntitlements(data.entitlements ?? entitlements);
          setError("upgrade_required");
          return;
        }
        throw new Error(data.error || "Failed to retry quiz");
      }
      setQuiz(data.quiz);
      setEntitlements(data.entitlements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry quiz");
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, videoId, entitlements]);

  const advanceAfterFeedback = useCallback(() => {
    setPendingFeedbackIndex(null);
  }, []);

  return {
    quiz,
    entitlements,
    isLoading,
    isGenerating,
    isSubmitting,
    error,
    pendingFeedbackIndex,
    fetchQuiz,
    generateQuiz,
    submitAnswer,
    retryQuiz,
    advanceAfterFeedback,
  };
}

type QuizPanelProps = {
  videoId: string;
  enabled: boolean;
};

export function QuizPanel({ videoId, enabled }: QuizPanelProps) {
  const t = useTranslations("quiz");
  const {
    quiz,
    entitlements,
    isLoading,
    isGenerating,
    isSubmitting,
    error,
    pendingFeedbackIndex,
    generateQuiz,
    submitAnswer,
    retryQuiz,
    advanceAfterFeedback,
  } = useQuiz({ videoId, enabled });

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const showUpgrade =
    error === "upgrade_required" ||
    (entitlements?.upgradeRequired && !quiz) ||
    (entitlements?.trialUsed && !entitlements.canGenerate && !quiz);

  if (showUpgrade && !quiz) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertTriangle className="size-10 text-amber-500" />
        <div className="space-y-2">
          <p className="font-semibold">{t("upgradeTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("upgradeDescription")}</p>
        </div>
        <Link href="/profile/billing">
          <Button>
            <Crown className="mr-2 size-4" />
            {t("upgradeCta")}
          </Button>
        </Link>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="space-y-2">
          <p className="font-semibold">{t("emptyTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
        </div>
        <Button onClick={() => generateQuiz()} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t("generating")}
            </>
          ) : (
            t("generate")
          )}
        </Button>
        {error && error !== "upgrade_required" && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  if (quiz.status === "completed" && pendingFeedbackIndex === null) {
    const wrongQuestions = quiz.questions.filter(
      (question): question is RevealedQuizQuestion =>
        "isCorrect" in question && !question.isCorrect,
    );

    return (
      <QuizResultsView
        score={quiz.score ?? 0}
        total={quiz.questions.length}
        wrongQuestions={wrongQuestions}
        onRetry={retryQuiz}
        onGenerateNew={
          entitlements?.canGenerate
            ? () => generateQuiz(true)
            : undefined
        }
        retryLabel={t("retry")}
        retryWithProLabel={t("retryWithPro")}
        generateNewLabel={t("generateNew")}
        generatingLabel={t("generating")}
        title={t("resultsTitle")}
        reviewTitle={t("reviewTitle")}
        seekLabel={t("seekToMoment")}
        upgradeRequired={Boolean(entitlements?.upgradeRequired)}
        canRetry={Boolean(entitlements?.canRetry)}
        canGenerate={Boolean(entitlements?.canGenerate)}
        isGenerating={isGenerating}
        onUpgrade={() => {
          window.location.href = "/profile/billing";
        }}
      />
    );
  }

  const activeIndex =
    pendingFeedbackIndex ?? Math.min(quiz.currentIndex, quiz.questions.length - 1);
  const activeQuestion = quiz.questions[activeIndex];
  const selectedIndex =
    "selectedIndex" in activeQuestion ? activeQuestion.selectedIndex : null;

  return (
    <QuizQuestionView
      question={activeQuestion}
      questionNumber={activeIndex + 1}
      totalQuestions={quiz.questions.length}
      onSelect={(index) => submitAnswer(activeIndex, index)}
      disabled={isSubmitting || pendingFeedbackIndex !== null}
      selectedIndex={selectedIndex}
      showFeedback={pendingFeedbackIndex === activeIndex}
      nextLabel={
        activeIndex >= quiz.questions.length - 1
          ? t("seeResults")
          : t("nextQuestion")
      }
      onNext={() => {
        if (activeIndex >= quiz.questions.length - 1) {
          advanceAfterFeedback();
          return;
        }
        advanceAfterFeedback();
      }}
      seekLabel={t("seekToMoment")}
    />
  );
}
