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

    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId)
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

    const video = await VideoRepository.getByYoutubeId(videoId)
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const dbSegments = await TranscriptRepository.getByVideoId(videoId)
    if (dbSegments.length === 0) {
      return NextResponse.json({ error: "No transcript available for this video" }, { status: 400 })
    }

    const summary = await generateUserVideoSummary(video, dbSegments, userVideo.id)
    await UserVideoRepository.updateSummary(userVideo.id, summary)

    return NextResponse.json({
      summary,
      cached: false
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
