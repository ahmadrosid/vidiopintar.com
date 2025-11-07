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

    // Get user_video from database
    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(userId, videoId)
    if (!userVideo) {
      return NextResponse.json({ error: "User video not found" }, { status: 404 })
    }

    // Check if questions already exist in DB
    if (userVideo.quickStartQuestions && userVideo.quickStartQuestions.length > 0) {
      return NextResponse.json({
        questions: userVideo.quickStartQuestions,
        cached: true
      })
    }

    // Get transcript segments from database
    const dbSegments = await TranscriptRepository.getByVideoId(videoId)
    if (dbSegments.length === 0) {
      return NextResponse.json({
        error: "No transcript available for this video"
      }, { status: 400 })
    }

    // Get video metadata for context
    const video = await VideoRepository.getByYoutubeId(videoId)

    // Generate quick start questions from transcript
    const questions = await generateQuickStartQuestions(
      dbSegments.map(seg => ({ text: seg.text })),
      video?.title,
      video?.description || undefined,
      userVideo.id,
      videoId
    )

    // Save to database for future requests
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
