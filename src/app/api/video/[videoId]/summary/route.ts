import { NextRequest, NextResponse } from "next/server"
import { UserVideoRepository, TranscriptRepository, VideoRepository } from "@/lib/db/repository"
import { getCurrentUser } from "@/lib/auth"
import { generateUserVideoSummary } from "@/lib/youtube"

export async function POST(request: NextRequest, props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;
  try {
    const { videoId } = params
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    const user = await getCurrentUser()
    const userId = user.id

    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(userId, videoId)
    if (!userVideo) {
      return NextResponse.json({ error: "User video not found" }, { status: 404 })
    }

    // Return cached summary unless force regeneration is requested
    if (!force && userVideo.summary && userVideo.summary.trim() !== '') {
      return NextResponse.json({
        summary: userVideo.summary,
        cached: true
      })
    }

    // Check if summary generation is already in progress
    if (userVideo.summaryStatus === 'generating') {
      return NextResponse.json({
        error: "Summary generation already in progress",
        status: "generating"
      }, { status: 409 })
    }

    const video = await VideoRepository.getByYoutubeId(videoId)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const dbSegments = await TranscriptRepository.getByVideoId(videoId)
    if (dbSegments.length === 0) {
      return NextResponse.json({ error: "No transcript available for this video" }, { status: 400 })
    }

    // Set status to generating (with atomic check)
    const lockAcquired = await UserVideoRepository.trySetGenerating(userVideo.id)
    if (!lockAcquired) {
      return NextResponse.json({
        error: "Summary generation already in progress",
        status: "generating"
      }, { status: 409 })
    }

    try {
      const summary = await generateUserVideoSummary(video, dbSegments, userVideo.id)
      await UserVideoRepository.updateSummaryWithStatus(userVideo.id, summary, 'completed')

      return NextResponse.json({
        summary,
        cached: false
      })
    } catch (error) {
      await UserVideoRepository.updateSummaryStatus(userVideo.id, 'failed')
      throw error
    }
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
