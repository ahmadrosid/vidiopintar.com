import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { UserPlanService } from '@/lib/user-plan-service';
import { extractVideoId } from '@/lib/utils';

function normalizeYouTubeUrl(url: string): string {
  const liveMatch = url.match(/\/live\/([a-zA-Z0-9_-]+)/);
  if (liveMatch) {
    return `https://www.youtube.com/watch?v=${liveMatch[1]}`;
  }
  return url;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { errors: ["Video URL is required"] },
        { status: 400 }
      );
    }

    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { errors: ["You must be logged in to add videos"] },
        { status: 401 }
      );
    }

    // Check user plan limits
    const planCheck = await UserPlanService.canAddVideo(user.id);
    if (!planCheck.canAdd) {
      if (planCheck.reason === 'daily_limit_reached') {
        const upgradeMessage = planCheck.currentPlan === 'free' 
          ? "You've reached your daily limit of 2 videos. You can still chat with existing videos. Upgrade for unlimited access or try again tomorrow."
          : "You've reached your daily video limit. Please try again tomorrow.";
        return NextResponse.json(
          { errors: [upgradeMessage], planLimitReached: true },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { errors: ["Unable to add video due to plan restrictions"] },
        { status: 403 }
      );
    }

    const normalizedUrl = normalizeYouTubeUrl(videoUrl);
    const youtubeVideoId = extractVideoId(normalizedUrl);
    if (!youtubeVideoId) {
      return NextResponse.json(
        { errors: ["Invalid YouTube URL. Please check the URL and try again."] },
        { status: 400 }
      );
    }

    // Return success with video ID for redirect
    return NextResponse.json({
      success: true,
      videoId: youtubeVideoId
    });

  } catch (error) {
    console.error('Video submit error:', error);
    return NextResponse.json(
      { errors: ['An unexpected error occurred. Please try again.'] },
      { status: 500 }
    );
  }
}