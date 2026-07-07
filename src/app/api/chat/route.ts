import { convertToModelMessages, streamText } from 'ai';

import { AI_MODEL_ID, AI_PROVIDER, aiModel, aiProviderOptions } from '@/lib/ai/model';
import { getMessageText } from '@/lib/ai/messages';
import { fetchVideoTranscript, fetchVideoDetails } from '@/lib/youtube';
import { MessageRepository, VideoRepository } from '@/lib/db/repository';
import { createStreamTokenTracker } from '@/lib/token-tracker';
import { getCurrentUser } from '@/lib/auth';
import { getSystemPrompt } from '@/lib/ai/system-prompts';
import { UserPlanService } from '@/lib/user-plan-service';

export async function POST(req: Request) {
  try {
    const { messages, videoId, userVideoId, language } = await req.json();
    
    const user = await getCurrentUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const canAddVideo = await UserPlanService.canAddVideo(user.id);
    if (!canAddVideo.canAdd) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily limit reached',
          reason: canAddVideo.reason,
          videosUsedToday: canAddVideo.videosUsedToday,
          dailyLimit: canAddVideo.dailyLimit,
          currentPlan: canAddVideo.currentPlan
        }), 
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  let transcriptText = '';
  let videoTitle = '';
  let videoDescription = '';

  if (videoId) {
    try {
      const transcriptResult = await fetchVideoTranscript(videoId);
      if (transcriptResult?.segments?.length > 0) {
        transcriptText = transcriptResult.segments.map((seg: any) => seg.text).join('\n');
      }

      let dbVideo = await VideoRepository.getByYoutubeId(videoId);

      if (dbVideo) {
        videoTitle = dbVideo.title || '';
        videoDescription = dbVideo.description || '';
      } else {
        const detailsResult = await fetchVideoDetails(videoId);
        if (detailsResult) {
          videoTitle = detailsResult.title;
          videoDescription = detailsResult.description;
        }
      }

    } catch (err) {
      console.error('Failed to fetch video data:', err);
    }
  }

  if (Array.isArray(messages)) {
    const lastUserMsg = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMsg) {
      try {
        await MessageRepository.create({
          userVideoId,
          content: getMessageText(lastUserMsg),
          role: 'user',
          timestamp: Math.floor(Date.now() / 1000),
        });
      } catch (err) {
        console.error('Failed to save user message:', err);
      }
    }
  }

  let modelMessages = convertToModelMessages(messages);
  if (transcriptText || videoTitle) {
    const systemContent = getSystemPrompt(language || 'en', {
      videoTitle,
      videoDescription,
      transcriptText,
    });
    
    modelMessages = [
      {
        role: 'system',
        content: systemContent,
      },
      ...modelMessages,
    ];
  }

    const tokenTracker = createStreamTokenTracker({
      userId: user.id,
      model: AI_MODEL_ID,
      provider: AI_PROVIDER,
      operation: 'chat',
      videoId,
      userVideoId,
    });

    const result = streamText({
      model: aiModel,
      providerOptions: aiProviderOptions,
      messages: modelMessages,
      onFinish: async ({ text, totalUsage }) => {
        try {
          await MessageRepository.create({
            userVideoId,
            content: text,
            role: 'assistant',
            timestamp: Math.floor(Date.now() / 1000),
          });
        } catch (err) {
          console.error('Failed to save assistant message:', err);
        }
        
        await tokenTracker.onFinish({ usage: totalUsage });
      },
      onError: (error) => {
        console.error('Streaming error:', error);
      }
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
