"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { QuizQuestionView } from "@/components/quiz/quiz-question";
import { QuizResultsView } from "@/components/quiz/quiz-results";
import type { PublicQuizQuestion, RevealedQuizQuestion, QuizEntitlements, QuizState } from "@/lib/quiz/types";

export type { QuizEntitlements, QuizState };

type UseQuizOptions = {
  videoId: string;
  initialQuiz?: QuizState | null;
  initialEntitlements?: QuizEntitlements | null;
};

export function useQuiz({
  videoId,
  initialQuiz = null,
  initialEntitlements = null,
}: UseQuizOptions) {
  const [quiz, setQuiz] = useState<QuizState | null>(initialQuiz);
  const [entitlements, setEntitlements] = useState<QuizEntitlements | null>(initialEntitlements);
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
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load quiz");
      }
      const data = await response.json();
      setQuiz(data.quiz ?? null);
      setEntitlements(data.entitlements ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

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
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          if (data.error === "upgrade_required") {
            setEntitlements(data.entitlements ?? entitlements);
            setError("upgrade_required");
            return;
          }
          throw new Error(data.error || "Failed to generate quiz");
        }
        const data = await response.json();
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
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to submit answer");
        }
        const data = await response.json();
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
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.error === "upgrade_required") {
          setEntitlements(data.entitlements ?? entitlements);
          setError("upgrade_required");
          return;
        }
        throw new Error(data.error || "Failed to retry quiz");
      }
      const data = await response.json();
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
  initialQuiz?: QuizState | null;
  initialEntitlements?: QuizEntitlements | null;
};

function QuizLoading() {
  return <div className="flex h-full w-full items-center justify-center p-6"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
}

function QuizUpgradePrompt() {
  const t = useTranslations("quiz");
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <AlertTriangle className="size-10 text-amber-500" />
      <div className="space-y-2"><p className="font-semibold">{t("upgradeTitle")}</p><p className="text-sm text-muted-foreground">{t("upgradeDescription")}</p></div>
      <Link href="/profile/billing"><Button><Crown className="mr-2 size-4" />{t("upgradeCta")}</Button></Link>
    </div>
  );
}

function QuizEmptyPrompt({ isGenerating, error, onGenerate }: { isGenerating: boolean; error: string | null; onGenerate: () => void }) {
  const t = useTranslations("quiz");
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="space-y-2"><p className="font-semibold">{t("emptyTitle")}</p><p className="text-sm text-muted-foreground">{t("emptyDescription")}</p></div>
      <Button onClick={onGenerate} disabled={isGenerating}>{isGenerating ? <><Loader2 className="mr-2 size-4 animate-spin" />{t("generating")}</> : t("generate")}</Button>
      {error && error !== "upgrade_required" && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function QuizResultsPanel({ quiz, entitlements, isGenerating, onRetry, onGenerate }: {
  quiz: QuizState;
  entitlements: QuizEntitlements | null;
  isGenerating: boolean;
  onRetry: () => void;
  onGenerate: () => void;
}) {
  const t = useTranslations("quiz");
  const wrongQuestions = quiz.questions.filter((question): question is RevealedQuizQuestion => "isCorrect" in question && !question.isCorrect);
  return <QuizResultsView score={quiz.score ?? 0} total={quiz.questions.length} wrongQuestions={wrongQuestions} onRetry={onRetry} onGenerateNew={entitlements?.canGenerate ? onGenerate : undefined} retryLabel={t("retry")} retryWithProLabel={t("retryWithPro")} generateNewLabel={t("generateNew")} generatingLabel={t("generating")} title={t("resultsTitle")} reviewTitle={t("reviewTitle")} seekLabel={t("seekToMoment")} upgradeRequired={Boolean(entitlements?.upgradeRequired)} canRetry={Boolean(entitlements?.canRetry)} canGenerate={Boolean(entitlements?.canGenerate)} isGenerating={isGenerating} onUpgrade={() => { window.location.href = "/profile/billing"; }} />;
}

function ActiveQuizQuestion({ quiz, pendingFeedbackIndex, isSubmitting, onSubmit, onAdvance }: {
  quiz: QuizState;
  pendingFeedbackIndex: number | null;
  isSubmitting: boolean;
  onSubmit: (index: number, answer: number) => void;
  onAdvance: () => void;
}) {
  const t = useTranslations("quiz");
  const activeIndex = pendingFeedbackIndex ?? Math.min(quiz.currentIndex, quiz.questions.length - 1);
  const activeQuestion = quiz.questions[activeIndex];
  const selectedIndex = "selectedIndex" in activeQuestion ? activeQuestion.selectedIndex : null;
  return <QuizQuestionView question={activeQuestion} questionNumber={activeIndex + 1} totalQuestions={quiz.questions.length} onSelect={(index) => onSubmit(activeIndex, index)} disabled={isSubmitting || pendingFeedbackIndex !== null} selectedIndex={selectedIndex} showFeedback={pendingFeedbackIndex === activeIndex} nextLabel={activeIndex >= quiz.questions.length - 1 ? t("seeResults") : t("nextQuestion")} onNext={onAdvance} seekLabel={t("seekToMoment")} />;
}

export function QuizPanel({
  videoId,
  initialQuiz = null,
  initialEntitlements = null,
}: QuizPanelProps) {
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
  } = useQuiz({ videoId, initialQuiz, initialEntitlements });

  if (isLoading) {
    return <QuizLoading />;
  }

  const showUpgrade =
    error === "upgrade_required" ||
    (entitlements?.upgradeRequired && !quiz) ||
    (entitlements?.trialUsed && !entitlements.canGenerate && !quiz);

  if (showUpgrade && !quiz) {
    return <QuizUpgradePrompt />;
  }

  if (!quiz) {
    return <QuizEmptyPrompt isGenerating={isGenerating} error={error} onGenerate={() => generateQuiz()} />;
  }

  if (quiz.status === "completed" && pendingFeedbackIndex === null) {
    return <QuizResultsPanel quiz={quiz} entitlements={entitlements} isGenerating={isGenerating} onRetry={retryQuiz} onGenerate={() => generateQuiz(true)} />;
  }

  return <ActiveQuizQuestion quiz={quiz} pendingFeedbackIndex={pendingFeedbackIndex} isSubmitting={isSubmitting} onSubmit={submitAnswer} onAdvance={advanceAfterFeedback} />;
}
