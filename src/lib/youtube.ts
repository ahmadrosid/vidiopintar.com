import { env } from "@/lib/env/server";
import { VideoRepository, TranscriptRepository, Video, UserRepository } from "@/lib/db/repository";
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { generateSummary } from "@/lib/ai/summary";
import { getQuickStartPrompt } from "@/lib/ai/system-prompts";
import { formatTime } from "@/lib/utils";
import { trackGenerateTextUsage } from '@/lib/token-tracker';

import { UserVideoRepository } from "@/lib/db/repository";
import { getCurrentUser } from "./auth";
import { addSeconds, format } from "date-fns";

async function saveVideoUser(videoId: string, video: Video, segments: any[], generateSummaryAsync: boolean = false) {
  const user = await getCurrentUser();

  const userVideo = await UserVideoRepository.upsert({
    userId: user.id,
    youtubeId: videoId,
    summary: '',
  });

  if (generateSummaryAsync) {
    generateUserVideoSummary(video, segments, userVideo.id)
      .then(summary => {
        return UserVideoRepository.updateSummary(userVideo.id, summary);
      })
      .catch(error => {
        console.error('Failed to generate summary asynchronously:', error);
      });

    return userVideo;
  } else {
    const summary = await generateUserVideoSummary(video, segments, userVideo.id);
    return await UserVideoRepository.updateSummary(userVideo.id, summary) || userVideo;
  }
}

export async function generateUserVideoSummary(video: Video, segments: any[], userVideoId?: number) {
  const transcriptText = segments.map((seg: {text: string}) => seg.text);
  const textToSummarize = `${video.title}\n${video.description ?? ""}\n${transcriptText}`;

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

async function getVideoDetailFromApi(videoId: string) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
  const encodedUrl = encodeURIComponent(videoUrl)
  const response = await fetch(`${env.API_BASE_URL}/youtube/video?videoUrl=${encodedUrl}`, {
    headers: {
      'X-API-Key': env.API_X_HEADER_API_KEY,
    },
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  return data;
}

export async function fetchVideoDetails(videoId: string) {
  try {
    const user = await getCurrentUser();
    let existingVideo = await VideoRepository.getByYoutubeId(videoId);
    const userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);
    
    if (existingVideo) {
      if (existingVideo.channelTitle === "Unknown Channel") {
        const videoDetails = await getVideoDetailFromApi(videoId);
        existingVideo = await VideoRepository.upsert({
          youtubeId: videoId,
          title: videoDetails.title,
          description: videoDetails.description,
          channelTitle: videoDetails.channelTitle,
          publishedAt: videoDetails.publishedAt ? new Date(videoDetails.publishedAt) : null,
          thumbnailUrl:
            videoDetails.thumbnails?.high?.url ||
            videoDetails.thumbnails?.medium?.url ||
            videoDetails.thumbnails?.default?.url ||
            null,
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

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const encodedUrl = encodeURIComponent(videoUrl);
    
    const response = await fetch(`${env.API_BASE_URL}/youtube/video?videoUrl=${encodedUrl}`, {
      headers: {
        'X-API-Key': env.API_X_HEADER_API_KEY,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch video details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    await VideoRepository.upsert({
      youtubeId: videoId,
      title: data.title,
      description: data.description,
      channelTitle: data.channelTitle,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      thumbnailUrl:
        data.thumbnails?.maxres?.url ||
        data.thumbnails?.standard?.url ||
        data.thumbnails?.high?.url ||
        data.thumbnails?.medium?.url ||
        data.thumbnails?.default?.url ||
        '',
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
    const dbSegments = await TranscriptRepository.getByVideoId(videoId);
    if (dbSegments.length > 0) {
      const segments = dbSegments
        .map((item: any) => ({
          start: item.start,
          end: item.end,
          text: item.text,
          isChapterStart: item.isChapterStart,
        }))
        .sort((a, b) => a.start - b.start);
      let userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);
      if (!userVideo) {
        const video = await VideoRepository.getByYoutubeId(videoId);
        // Create userVideo without generating summary (will be done client-side)
        userVideo = await UserVideoRepository.upsert({
          userId: user.id,
          youtubeId: videoId,
          summary: '', // Empty initially, will be generated client-side
        });
      }
      return { segments, userVideo };
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const encodedUrl = encodeURIComponent(videoUrl)
    const response = await fetch(`${env.API_BASE_URL}/youtube/transcript?videoUrl=${encodedUrl}`, {
      headers: {
        'X-API-Key': env.API_X_HEADER_API_KEY,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()

    // Check if transcript content exists
    if (!data.content || data.content.length === 0) {
      throw new Error('No transcript content available')
    }

    const segments = data.content.map((item: any, index: number) => {
      const start = parseInt(item.start, 10) / 1000
      const end = parseInt(item.end, 10) / 1000

      const baseDate = new Date(0)
      baseDate.setHours(0, 0, 0, 0)

      const startTime = addSeconds(baseDate, Number(start))
      const endTime = addSeconds(baseDate, Number(end))

      const isChapterStart = item.text.length < 30 &&
                            !item.text.includes('segment') &&
                            item.text !== 'N/A' &&
                            (index === 0 || index % 10 === 0)

      return {
        start: format(startTime, 'HH:mm:ss'),
        end: format(endTime, 'HH:mm:ss'),
        text: item.text !== 'N/A' ? item.text : `Segment at ${formatTime(start)}`,
        isChapterStart,
      }
    })

    // Only save transcript and create userVideo if we have valid segments
    await TranscriptRepository.upsertSegments(videoId, segments);

    const video = await VideoRepository.getByYoutubeId(videoId);
    let userVideo = await UserVideoRepository.getByUserAndYoutubeId(user.id, videoId);
    
    // Ensure userVideo exists for this user + video now that we have a transcript
    if (!userVideo) {
      userVideo = await UserVideoRepository.upsert({
        userId: user.id,
        youtubeId: videoId,
        summary: '', // Empty initially, will be generated client-side
      });
    }

    // If we already have a video record, keep its metadata up to date
    if (video) {
      await VideoRepository.upsert({
        youtubeId: videoId,
        title: video.title,
        description: video.description,
        channelTitle: video.channelTitle,
        publishedAt: video.publishedAt,
        thumbnailUrl: video.thumbnailUrl,
      });
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
  const modelName = 'gpt-5-nano';
  const result = await generateObject({
    model: openai(modelName),
    prompt: prompt,
    schema: z.object({
      questions: z.array(z.string()),
    }),
  });

  try {
    const user = await getCurrentUser();
    await trackGenerateTextUsage(result, {
      userId: user.id,
      model: modelName,
      provider: 'openai',
      operation: 'quick_start_questions',
      videoId,
      userVideoId,
      requestDuration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Failed to track quick start questions token usage:', error);
  }

  const questions = result.object?.questions || [];

  if (userVideoId && questions.length > 0) {
    await UserVideoRepository.updateQuickStartQuestions(userVideoId, questions);
  }

  return questions;
}
