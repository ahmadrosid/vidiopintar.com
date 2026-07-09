import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserVideoRepository } from "@/lib/db/repository";
import { QuizRepository } from "@/lib/db/repository/quizzes";
import { UserPlanService } from "@/lib/user-plan-service";
import {
  computeQuizScore,
  sanitizeQuestionsForClient,
} from "@/lib/quiz/types";

function buildQuizPayload(
  quiz: NonNullable<Awaited<ReturnType<typeof QuizRepository.getLatestQuizForUserVideo>>>,
  attempt: NonNullable<Awaited<ReturnType<typeof QuizRepository.getLatestAttemptForQuiz>>>,
) {
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

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ videoId: string }> },
) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    const { videoId } = params;
    const body = await request.json();
    const { attemptId, questionIndex, selectedIndex } = body ?? {};

    if (
      typeof attemptId !== "number" ||
      typeof questionIndex !== "number" ||
      typeof selectedIndex !== "number"
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(
      user.id,
      videoId,
    );
    if (!userVideo) {
      return NextResponse.json({ error: "User video not found" }, { status: 404 });
    }

    const quiz = await QuizRepository.getLatestQuizForUserVideo(
      userVideo.id,
      user.id,
    );
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const attempt = await QuizRepository.getAttemptById(attemptId, user.id);
    if (!attempt || attempt.quizId !== quiz.id) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status === "completed") {
      return NextResponse.json({
        quiz: buildQuizPayload(quiz, attempt),
        entitlements: await UserPlanService.getQuizEntitlements(user.id),
      });
    }

    if (questionIndex !== attempt.currentIndex) {
      return NextResponse.json(
        { error: "Answer the current question first" },
        { status: 400 },
      );
    }

    const question = quiz.questions[questionIndex];
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 400 });
    }

    const answers = [...attempt.answers];
    answers[questionIndex] = selectedIndex;

    const isLastQuestion = questionIndex >= quiz.questions.length - 1;
    const nextIndex = isLastQuestion
      ? questionIndex
      : questionIndex + 1;

    const updatedAttempt = await QuizRepository.updateAttemptProgress({
      attemptId: attempt.id,
      userId: user.id,
      answers,
      currentIndex: nextIndex,
      status: isLastQuestion ? "completed" : "in_progress",
      score: isLastQuestion ? computeQuizScore(quiz.questions, answers) : undefined,
      completedAt: isLastQuestion ? new Date() : undefined,
    });

    if (!updatedAttempt) {
      return NextResponse.json(
        { error: "Failed to update attempt" },
        { status: 500 },
      );
    }

    const feedback = {
      questionIndex,
      isCorrect: selectedIndex === question.correctIndex,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      timestampSeconds: question.timestampSeconds,
    };

    return NextResponse.json({
      quiz: buildQuizPayload(quiz, updatedAttempt),
      feedback,
      entitlements: await UserPlanService.getQuizEntitlements(user.id),
    });
  } catch (error) {
    console.error("Error updating quiz attempt:", error);
    return NextResponse.json(
      { error: "Failed to update quiz attempt" },
      { status: 500 },
    );
  }
}

export async function POST(
  _request: NextRequest,
  props: { params: Promise<{ videoId: string }> },
) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    const { videoId } = params;

    const retryCheck = await UserPlanService.canRetryQuiz(user.id);
    if (!retryCheck.allowed) {
      return NextResponse.json(
        {
          error: "upgrade_required",
          message: "Retry requires a paid plan after your free trial.",
          entitlements: await UserPlanService.getQuizEntitlements(user.id),
        },
        { status: 403 },
      );
    }

    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(
      user.id,
      videoId,
    );
    if (!userVideo) {
      return NextResponse.json({ error: "User video not found" }, { status: 404 });
    }

    const quiz = await QuizRepository.getLatestQuizForUserVideo(
      userVideo.id,
      user.id,
    );
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const latestAttempt = await QuizRepository.getLatestAttemptForQuiz(
      quiz.id,
      user.id,
    );
    if (!latestAttempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const resetAttempt = await QuizRepository.resetAttemptForRetry(
      latestAttempt.id,
      user.id,
      quiz.questions.length,
    );

    if (!resetAttempt) {
      return NextResponse.json(
        { error: "Failed to reset quiz attempt" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      quiz: buildQuizPayload(quiz, resetAttempt),
      entitlements: await UserPlanService.getQuizEntitlements(user.id),
    });
  } catch (error) {
    console.error("Error retrying quiz:", error);
    return NextResponse.json(
      { error: "Failed to retry quiz" },
      { status: 500 },
    );
  }
}
