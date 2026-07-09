import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserVideoRepository, TranscriptRepository, VideoRepository } from "@/lib/db/repository";
import { QuizRepository } from "@/lib/db/repository/quizzes";
import { UsageEventRepository } from "@/lib/db/repository/usage-events";
import { UserPlanService } from "@/lib/user-plan-service";
import { generateQuizFromTranscript } from "@/lib/ai/quiz";
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

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ videoId: string }> },
) {
  const params = await props.params;
  try {
    const user = await getCurrentUser();
    const { videoId } = params;

    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(
      user.id,
      videoId,
    );
    if (!userVideo) {
      return NextResponse.json({ error: "User video not found" }, { status: 404 });
    }

    const entitlements = await UserPlanService.getQuizEntitlements(user.id);
    const quiz = await QuizRepository.getLatestQuizForUserVideo(
      userVideo.id,
      user.id,
    );

    if (!quiz) {
      return NextResponse.json({
        quiz: null,
        entitlements,
      });
    }

    const attempt = await QuizRepository.getLatestAttemptForQuiz(
      quiz.id,
      user.id,
    );

    if (!attempt) {
      return NextResponse.json({
        quiz: null,
        entitlements,
      });
    }

    return NextResponse.json({
      quiz: buildQuizPayload(quiz, attempt),
      entitlements,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ videoId: string }> },
) {
  const params = await props.params;
  let reservedForFree = false;

  try {
    const user = await getCurrentUser();
    const { videoId } = params;
    const body = await request.json().catch(() => ({}));
    const regenerate = Boolean(body?.regenerate);

    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(
      user.id,
      videoId,
    );
    if (!userVideo) {
      return NextResponse.json({ error: "User video not found" }, { status: 404 });
    }

    const entitlements = await UserPlanService.getQuizEntitlements(user.id);
    const existingQuiz = await QuizRepository.getLatestQuizForUserVideo(
      userVideo.id,
      user.id,
    );

    if (existingQuiz && !regenerate) {
      const existingAttempt = await QuizRepository.getLatestAttemptForQuiz(
        existingQuiz.id,
        user.id,
      );
      if (existingAttempt) {
        return NextResponse.json({
          quiz: buildQuizPayload(existingQuiz, existingAttempt),
          entitlements,
          cached: true,
        });
      }
    }

    const generateCheck = await UserPlanService.canGenerateQuiz(user.id);
    if (!generateCheck.allowed) {
      return NextResponse.json(
        {
          error: "upgrade_required",
          message: "Quiz generation requires a paid plan after your free trial.",
          entitlements,
        },
        { status: 403 },
      );
    }

    const dbSegments = await TranscriptRepository.getByVideoId(videoId);
    if (dbSegments.length === 0) {
      return NextResponse.json(
        { error: "No transcript available for this video" },
        { status: 400 },
      );
    }

    const plan = await UserPlanService.getCurrentPlan(user.id);
    const isPaid = UserPlanService.getPlanLimits(plan).unlimited;

    if (!isPaid) {
      const reserved = await UsageEventRepository.tryReserveQuizGeneration(
        user.id,
      );
      if (!reserved) {
        return NextResponse.json(
          {
            error: "upgrade_required",
            message: "Your free quiz trial has already been used.",
            entitlements: await UserPlanService.getQuizEntitlements(user.id),
          },
          { status: 403 },
        );
      }
      reservedForFree = true;
    }

    const video = await VideoRepository.getByYoutubeId(videoId);
    const generated = await generateQuizFromTranscript({
      transcriptSegments: dbSegments.map((seg) => ({ text: seg.text })),
      videoTitle: video?.title,
      videoDescription: video?.description || undefined,
      videoId,
      userVideoId: userVideo.id,
    });

    const quiz = await QuizRepository.createQuiz({
      userVideoId: userVideo.id,
      youtubeId: videoId,
      userId: user.id,
      questions: generated.questions,
      language: generated.language,
    });

    const attempt = await QuizRepository.createAttempt({
      quizId: quiz.id,
      userId: user.id,
      questionCount: generated.questions.length,
    });

    const updatedEntitlements = await UserPlanService.getQuizEntitlements(
      user.id,
    );

    return NextResponse.json({
      quiz: buildQuizPayload(quiz, attempt),
      entitlements: updatedEntitlements,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    if (reservedForFree) {
      try {
        const user = await getCurrentUser();
        await UsageEventRepository.releaseQuizGeneration(user.id);
      } catch (releaseError) {
        console.error("Failed to release quiz reservation:", releaseError);
      }
    }
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 },
    );
  }
}
