import { NextRequest, NextResponse } from "next/server"
import { UserVideoRepository, TranscriptRepository, UserRepository } from "@/lib/db/repository"
import { getCurrentUser } from "@/lib/auth"
import { generateSummary } from "@/lib/ai/summary"

export async function POST(request: NextRequest, props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;
  try {
    const { videoId } = params
    const user = await getCurrentUser()
    const userId = user.id

    // Get user_video and transcript from database
    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(userId, videoId)
    if (!userVideo) {
      return NextResponse.json({ error: "User video not found" }, { status: 404 })
    }

    // Fetch video info for title/description
    const video = await import("@/lib/db/repository").then((m) =>
      m.VideoRepository.getByYoutubeId(userVideo.youtubeId)
    )
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const dbSegments = await TranscriptRepository.getByVideoId(videoId)
    if (dbSegments.length === 0) {
      return NextResponse.json({ error: "No transcript available for this video" }, { status: 400 })
    }

    // Get user's language preference
    let userLanguage: 'en' | 'id' = 'en'; // Default to English
    try {
      const savedLanguage = await UserRepository.getPreferredLanguage(user.id);
      if (savedLanguage === 'en' || savedLanguage === 'id') {
        userLanguage = savedLanguage;
      }
    } catch (error) {
      console.log('Could not get user language preference for summary regeneration, using default:', error);
    }

    // Generate summary from existing transcript
    const transcriptText = dbSegments.map((seg) => seg.text).join(" ")

    const textToSummarize = `${video.title}\n${video.description ?? ""}\n${transcriptText}`
    const summary = await generateSummary(textToSummarize, userLanguage, video.youtubeId, userVideo.id)

    // Update user_video with new summary
    await UserVideoRepository.updateSummary(userVideo.id, summary)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Error regenerating summary:", error)
    return NextResponse.json({ error: "Failed to regenerate summary" }, { status: 500 })
  }
}
