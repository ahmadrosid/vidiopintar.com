import { convertToModelMessages, stepCountIs, streamText } from 'ai';

import { buildCreateNoteTool } from '@/lib/ai/create-note-tool';
import { AI_MODEL_ID, AI_PROVIDER, aiModel, aiProviderOptions } from '@/lib/ai/model';
import { getMessageText } from '@/lib/ai/messages';
import { getSystemPrompt } from '@/lib/ai/system-prompts';
import { fetchVideoTranscript, fetchVideoDetails } from '@/lib/youtube';
import { MessageRepository, UserVideoRepository, VideoRepository } from '@/lib/db/repository';
import { UsageEventRepository } from '@/lib/db/repository/usage-events';
import { createStreamTokenTracker } from '@/lib/token-tracker';
import { getCurrentUser } from '@/lib/auth';
import { UserPlanService } from '@/lib/user-plan-service';
import { formatTimedTranscriptForChat } from '@/lib/transcript-segments';
import type { StoredTranscriptSegment } from '@/lib/transcript-segments';

export async function POST(req: Request) {
  try {
    const { messages, videoId, userVideoId, language, currentTime } = await req.json();
    
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

    if (!userVideoId) {
      return new Response(
        JSON.stringify({ error: 'Video context required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const userVideo = await UserVideoRepository.getById(userVideoId);
    if (!userVideo || userVideo.userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User video not found or unauthorized' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const canSendMessage = await UserPlanService.canSendMessage(user.id, userVideoId);
    if (!canSendMessage.canSend) {
      if (canSendMessage.reason === 'message_limit_reached') {
        return new Response(
          JSON.stringify({
            error: 'Message limit reached',
            reason: canSendMessage.reason,
            messagesUsed: canSendMessage.messagesUsed,
            messageLimit: canSendMessage.messageLimit,
            currentPlan: canSendMessage.currentPlan,
          }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Unable to send message' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  let transcriptText = '';
  let videoTitle = '';
  let videoDescription = '';
  const playbackTime =
    typeof currentTime === 'number' && Number.isFinite(currentTime) && currentTime >= 0
      ? currentTime
      : undefined;

  if (videoId) {
    try {
      const transcriptResult = await fetchVideoTranscript(videoId);
      if (transcriptResult?.segments?.length > 0) {
        transcriptText = formatTimedTranscriptForChat(
          transcriptResult.segments as StoredTranscriptSegment[],
        );
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

        const usageYoutubeId =
          videoId ??
          (await UserVideoRepository.getById(userVideoId))?.youtubeId;
        if (usageYoutubeId) {
          await UsageEventRepository.recordChatMessage(user.id, usageYoutubeId);
        }
      } catch (err) {
        console.error('Failed to save user message:', err);
      }
    }
  }

  let modelMessages = convertToModelMessages(messages);
  if (transcriptText || videoTitle || playbackTime != null) {
    const systemContent = getSystemPrompt(language || 'en', {
      videoTitle,
      videoDescription,
      transcriptText,
      currentTime: playbackTime,
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
      tools: {
        createNote: buildCreateNoteTool({
          userId: user.id,
          userVideoId,
        }),
      },
      stopWhen: stepCountIs(5),
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
