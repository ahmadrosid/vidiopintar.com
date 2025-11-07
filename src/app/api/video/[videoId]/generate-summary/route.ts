import { NextRequest, NextResponse } from "next/server"
import { UserVideoRepository, TranscriptRepository, VideoRepository, UserRepository } from "@/lib/db/repository"
import { getCurrentUser } from "@/lib/auth"
import { generateSummary } from "@/lib/ai/summary"

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

    if (userVideo.summary && userVideo.summary.trim() !== '') {
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

    let userLanguage: 'en' | 'id' = 'en';
    try {
      const savedLanguage = await UserRepository.getPreferredLanguage(user.id);
      if (savedLanguage === 'en' || savedLanguage === 'id') {
        userLanguage = savedLanguage;
      }
    } catch (error) {
      console.log('Could not get user language preference for summary generation, using default:', error);
    }

    const transcriptText = dbSegments.map((seg) => seg.text).join(" ")
    const textToSummarize = `${video.title}\n${video.description ?? ""}\n${transcriptText}`
    const summary = await generateSummary(textToSummarize, userLanguage, video.youtubeId, userVideo.id)

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
