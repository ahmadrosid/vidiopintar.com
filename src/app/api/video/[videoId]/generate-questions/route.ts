import { NextRequest, NextResponse } from "next/server"
import { UserVideoRepository, TranscriptRepository, VideoRepository } from "@/lib/db/repository"
import { getCurrentUser } from "@/lib/auth"
import { generateQuickStartQuestions } from "@/lib/youtube"

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

    const dbSegments = await TranscriptRepository.getByVideoId(videoId)
    if (dbSegments.length === 0) {
      return NextResponse.json({
        error: "No transcript available for this video"
      }, { status: 400 })
    }

    const video = await VideoRepository.getByYoutubeId(videoId)
    const questions = await generateQuickStartQuestions(
      dbSegments.map(seg => ({ text: seg.text })),
      video?.title,
      video?.description || undefined,
      userVideo.id,
      videoId
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
