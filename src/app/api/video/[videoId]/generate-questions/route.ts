import { NextRequest, NextResponse } from "next/server"
import { UserVideoRepository, TranscriptRepository, VideoRepository } from "@/lib/db/repository"
import { getCurrentUser } from "@/lib/auth"
import { generateQuickStartQuestions } from "@/lib/youtube"
import { retryWithDelay, sleep } from "@/lib/retry"

async function getTranscriptSegmentsWithRetry(videoId: string) {
  const maxAttempts = 3;
  const delayMs = 2000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const segments = await TranscriptRepository.getByVideoId(videoId);
    if (segments.length > 0) {
      return segments;
    }

    if (attempt < maxAttempts) {
      console.warn(
        `No transcript segments for ${videoId} (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`,
      );
      await sleep(delayMs);
    }
  }

  return [];
}

export async function POST(request: NextRequest, props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;
  try {
    const { videoId } = params
    const user = await getCurrentUser()
    const userId = user.id

    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(userId, videoId)
    if (!userVideo) {
      return NextResponse.json({ error: "User video not found" }, { status: 404 })
    }

    if (userVideo.quickStartQuestions && userVideo.quickStartQuestions.length > 0) {
      return NextResponse.json({
        questions: userVideo.quickStartQuestions,
        cached: true
      })
    }

    const dbSegments = await getTranscriptSegmentsWithRetry(videoId)
    if (dbSegments.length === 0) {
      return NextResponse.json({
        error: "No transcript available for this video"
      }, { status: 400 })
    }

    const video = await VideoRepository.getByYoutubeId(videoId)
    const questions = await retryWithDelay(
      () =>
        generateQuickStartQuestions(
          dbSegments.map((seg) => ({ text: seg.text })),
          video?.title,
          video?.description || undefined,
          userVideo.id,
          videoId,
        ),
      {
        maxAttempts: 3,
        delayMs: 2000,
        onRetry: (attempt, error) => {
          console.warn(
            `Quick start question generation failed (attempt ${attempt}/3), retrying in 2000ms...`,
            error,
          );
        },
      },
    )

    await UserVideoRepository.updateQuickStartQuestions(userVideo.id, questions)
    return NextResponse.json({
      questions,
      cached: false
    })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
