import { QuizRepository } from "@/lib/db/repository/quizzes";
import { UserPlanService } from "@/lib/user-plan-service";
import { UserVideoRepository } from "@/lib/db/repository";
import {
  computeQuizScore,
  sanitizeQuestionsForClient,
} from "@/lib/quiz/types";
import type { QuizEntitlements, QuizState } from "@/lib/quiz/types";

function buildQuizPayload(
  quiz: NonNullable<Awaited<ReturnType<typeof QuizRepository.getLatestQuizForUserVideo>>>,
  attempt: NonNullable<Awaited<ReturnType<typeof QuizRepository.getLatestAttemptForQuiz>>>,
): QuizState {
  return {
    quizId: quiz.id,
    attemptId: attempt.id,
    status: attempt.status,
    currentIndex: attempt.currentIndex,
    score: attempt.score,
    questions: sanitizeQuestionsForClient(
      quiz.questions,
      attempt.answers,
      attempt.currentIndex,
      attempt.status,
    ),
  };
}

export async function getQuizStateForVideo(
  userId: string,
  videoId: string,
): Promise<{ quiz: QuizState | null; entitlements: QuizEntitlements }> {
  const userVideo = await UserVideoRepository.getByUserAndYoutubeId(userId, videoId);
  if (!userVideo) {
    throw new Error("User video not found");
  }

  const [entitlements, quiz] = await Promise.all([
    UserPlanService.getQuizEntitlements(userId),
    QuizRepository.getLatestQuizForUserVideo(userVideo.id, userId),
  ]);

  if (!quiz) {
    return { quiz: null, entitlements };
  }

  const attempt = await QuizRepository.getLatestAttemptForQuiz(quiz.id, userId);
  if (!attempt) {
    return { quiz: null, entitlements };
  }

  return {
    quiz: buildQuizPayload(quiz, attempt),
    entitlements,
  };
}