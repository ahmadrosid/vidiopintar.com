import { VideoRepository, Video, UserRepository } from "@/lib/db/repository";
import { generateObject } from 'ai';
import { AI_MODEL_ID, AI_PROVIDER, aiModel, aiProviderOptions } from '@/lib/ai/model';
import { fetchTranscriptResponse, fetchVideoInfoFromApi } from '@/lib/transcript-api';
import {
  formatTimedTranscriptForChat,
  type StoredTranscriptSegment,
  transcriptApiSegmentsToStored,
} from '@/lib/transcript-segments';
import { z } from 'zod';
import { generateSummary } from "@/lib/ai/summary";
import { getQuickStartPrompt } from "@/lib/ai/system-prompts";
import { trackGenerateTextUsage } from '@/lib/token-tracker';

import { UserVideoRepository } from "@/lib/db/repository";
import { UsageEventRepository } from "@/lib/db/repository/usage-events";
import { UserPlanService } from "@/lib/user-plan-service";
import { getCurrentUser } from "./auth";

function pickThumbnailUrl(
  thumbnails?: { high?: { url: string } } | Record<string, never>,
): string | null {
  return thumbnails && "high" in thumbnails ? thumbnails.high?.url ?? null : null;
}

export async function generateUserVideoSummary(
  video: Video,
  segments: StoredTranscriptSegment[],
  userVideoId?: number,
) {
  const timedTranscript = formatTimedTranscriptForChat(segments);
  const textToSummarize = `${video.title}\n${video.description ?? ""}\n\n${timedTranscript}`;

  let userLanguage: 'en' | 'id' = 'en';
  try {
    const user = await getCurrentUser();
    const savedLanguage = await UserRepository.getPreferredLanguage(user.id);
    if (savedLanguage === 'en' || savedLanguage === 'id') {
      userLanguage = savedLanguage;
    }
  } catch (error) {
    console.log('Could not get user language preference, using default:', error);
  }
  
  const summary = await generateSummary(textToSummarize, userLanguage, video.youtubeId, userVideoId);

  return summary;
}

async function fetchVideoFromOEmbed(videoId: string) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
  };

  return {
    title: data.title ?? `Video ${videoId}`,
    description: "",
    channelTitle: data.author_name ?? "Unknown Channel",
    publishedAt: null,
    thumbnails: data.thumbnail_url ? { high: { url: data.thumbnail_url } } : {},
    tags: [] as string[],
  };
}

async function fetchVideoFromApi(videoId: string) {
  try {
    const info = await fetchVideoInfoFromApi(videoId);
    const metadata = info.metadata;

    return {
      title: metadata.title ?? `Video ${videoId}`,
      description: "",
      channelTitle: metadata.author_name ?? "Unknown Channel",
      publishedAt: null,
      thumbnails: metadata.thumbnail_url
        ? { high: { url: metadata.thumbnail_url } }
        : {},
      tags: [] as string[],
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return fetchVideoFromOEmbed(videoId);
    }
    throw error;
  }
}

export async function fetchVideoDetails(videoId: string) {
  try {
    const user = await getCurrentUser();
    let existingVideo = await VideoRepository.getByYoutubeId(videoId);
    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);

    if (existingVideo) {
      if (existingVideo.channelTitle === "Unknown Channel") {
        const videoDetails = await fetchVideoFromApi(videoId);
        existingVideo = await VideoRepository.upsert({
          youtubeId: videoId,
          title: videoDetails.title,
          description: videoDetails.description,
          channelTitle: videoDetails.channelTitle,
          publishedAt: videoDetails.publishedAt ? new Date(videoDetails.publishedAt) : null,
          thumbnailUrl: pickThumbnailUrl(videoDetails.thumbnails),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return {
        title: existingVideo.title,
        description: existingVideo.description || "",
        channelTitle: existingVideo.channelTitle || "",
        publishedAt: existingVideo.publishedAt?.toISOString(),
        thumbnails: { high: { url: existingVideo.thumbnailUrl || "" } },
        tags: [],
        userVideo,
        video: existingVideo,
      };
    }

    const data = await fetchVideoFromApi(videoId);

    await VideoRepository.upsert({
      youtubeId: videoId,
      title: data.title,
      description: data.description,
      channelTitle: data.channelTitle,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      thumbnailUrl: pickThumbnailUrl(data.thumbnails) ?? '',
    });
    
    return {
      title: data.title,
      description: data.description,
      channelTitle: data.channelTitle,
      publishedAt: data.publishedAt,
      thumbnails: data.thumbnails,
      tags: data.tags,
      userVideo,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);

    return {
      title: `Video ${videoId}`,
      description: "Unable to load video description.",
      channelTitle: "Unknown Channel",
      publishedAt: new Date().toISOString(),
      thumbnails: {},
      tags: [],
      userVideo: null,
    };
  }
}

export async function fetchVideoTranscript(videoId: string) {
  try {
    const user = await getCurrentUser();

    let transcriptLanguage = 'en';
    try {
      const savedLanguage = await UserRepository.getPreferredLanguage(user.id);
      if (savedLanguage === 'en' || savedLanguage === 'id') {
        transcriptLanguage = savedLanguage;
      }
    } catch (error) {
      console.log('Could not get user language preference for transcript, using default:', error);
    }

    const transcriptResponse = await fetchTranscriptResponse(videoId, {
      language: transcriptLanguage,
      sendMetadata: true,
    });

    const segments = transcriptApiSegmentsToStored(transcriptResponse.transcript);

    // user_videos.youtube_id references videos.youtube_id — ensure parent row exists
    // before upserting (fetchVideoDetails may still be running in parallel).
    const existingVideo = await VideoRepository.getByYoutubeId(videoId);
    if (!existingVideo) {
      const metadata = transcriptResponse.metadata;
      await VideoRepository.upsert({
        youtubeId: videoId,
        title: metadata?.title ?? `Video ${videoId}`,
        description: "",
        channelTitle: metadata?.author_name ?? "Unknown Channel",
        publishedAt: null,
        thumbnailUrl: metadata?.thumbnail_url ?? null,
      });
    }

    let userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);
    if (!userVideo) {
      const planCheck = await UserPlanService.canAddVideo(user.id, videoId);
      if (!planCheck.canAdd) {
        return {
          segments: [],
          error: true,
          errorMessage: "You've reached your daily limit for new videos. Upgrade for unlimited access or try again tomorrow.",
          userVideo: null,
          planLimitReached: true,
        };
      }

      userVideo = await UserVideoRepository.upsert({
        userId: user.id,
        youtubeId: videoId,
        summary: "",
      });
      await UsageEventRepository.recordVideoAdded(user.id, videoId);
    }

    return {
      segments,
      userVideo
    }
  } catch (error) {
    console.error('Error fetching transcript:', error)
    // Don't create userVideo if transcript is not available
    return {
      segments: [],
      error: true,
      errorMessage: "Transcript not available for this video",
      userVideo: null
    }
  }
}

export async function generateQuickStartQuestions(
  transcriptSegments: Array<{ text: string }>,
  videoTitle?: string,
  videoDescription?: string,
  userVideoId?: number,
  videoId?: string
) {
  let userLanguage: 'en' | 'id' = 'en';
  try {
    const user = await getCurrentUser();
    const savedLanguage = await UserRepository.getPreferredLanguage(user.id);
    if (savedLanguage === 'en' || savedLanguage === 'id') {
      userLanguage = savedLanguage;
    }
  } catch (error) {
    console.log('Could not get user language preference for quick start questions, using default:', error);
  }

  // Join transcript segments and truncate if too long
  const fullTranscript = transcriptSegments.map(seg => seg.text).join(' ');

  // Truncate to approximately 6000 words to manage token usage
  const words = fullTranscript.split(/\s+/);
  const truncatedTranscript = words.slice(0, 6000).join(' ');

  const promptText = getQuickStartPrompt(userLanguage);

  // Build context with optional video metadata
  let contextSection = '';
  if (videoTitle) {
    contextSection += `Video Title: ${videoTitle}\n`;
  }
  if (videoDescription) {
    contextSection += `Video Description: ${videoDescription}\n`;
  }

  const prompt = `${promptText}

${contextSection ? contextSection + '\n' : ''}Here is the video transcript:

<transcript>
${truncatedTranscript}
</transcript>
`;

  const startTime = Date.now();
  const result = await generateObject({
    model: aiModel,
    providerOptions: aiProviderOptions,
    prompt: prompt,
    output: 'array',
    schema: z.string(),
    schemaDescription: 'A first-person learning question about the video content',
  });

  try {
    const user = await getCurrentUser();
    await trackGenerateTextUsage(result, {
      userId: user.id,
      model: AI_MODEL_ID,
      provider: AI_PROVIDER,
      operation: 'quick_start_questions',
      videoId,
      userVideoId,
      requestDuration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Failed to track quick start questions token usage:', error);
  }

  const questions = result.object ?? [];

  if (userVideoId && questions.length > 0) {
    await UserVideoRepository.updateQuickStartQuestions(userVideoId, questions);
  }

  return questions;
}
