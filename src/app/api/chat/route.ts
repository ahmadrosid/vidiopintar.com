import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';

import { fetchVideoTranscript, fetchVideoDetails } from '@/lib/youtube';
import { MessageRepository, VideoRepository, UserRepository, NoteRepository } from '@/lib/db/repository';
import { createStreamTokenTracker } from '@/lib/token-tracker';
import { getCurrentUser } from '@/lib/auth';
import { getSystemPrompt } from '@/lib/ai/system-prompts';
import { UserPlanService } from '@/lib/user-plan-service';
import { NOTE_COLORS } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const { messages, videoId, userVideoId, language, autoSaveNotes } = await req.json();
    
    // Get user for token tracking - required for chat functionality
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

    // Check if user can add videos (daily limit check)
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

  // Helper function to convert timestamp to seconds
  const parseTimeToSeconds = (time: string | number): number => {
    if (typeof time === 'number') return time;
    // Parse HH:mm:ss format to seconds
    const parts = time.split(':').map(Number);
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  if (videoId) {
    try {
      const transcriptResult = await fetchVideoTranscript(videoId);
      if (transcriptResult?.segments?.length > 0) {
        // Include timestamps in transcript so AI can reference them
        transcriptText = transcriptResult.segments
          .map((seg: any) => {
            const timestampSeconds = parseTimeToSeconds(seg.start);
            return `[${timestampSeconds}s] ${seg.text}`;
          })
          .join('\n');
        
        // Log transcript info for debugging
        if (transcriptResult.segments.length > 0) {
          const sampleSegment = transcriptResult.segments[0];
          const lastSegment = transcriptResult.segments[transcriptResult.segments.length - 1];
          const sampleTimestamp = parseTimeToSeconds(sampleSegment.start);
          const lastTimestamp = parseTimeToSeconds(lastSegment.start);
          console.log('[Chat API] Transcript info:', {
            totalSegments: transcriptResult.segments.length,
            firstTimestamp: sampleTimestamp,
            lastTimestamp: lastTimestamp,
            transcriptLength: transcriptText.length,
            sampleLine: `[${sampleTimestamp}s] ${sampleSegment.text.substring(0, 50)}...`,
            lastLine: `[${lastTimestamp}s] ${lastSegment.text.substring(0, 50)}...`
          });
        }
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
          content: lastUserMsg.content,
          role: 'user',
          timestamp: Math.floor(Date.now() / 1000),
        });
      } catch (err) {
        console.error('Failed to save user message:', err);
      }
    }
  }

  let enrichedMessages = messages;
  if (transcriptText || videoTitle) {
    const systemContent = getSystemPrompt(language || 'en', {
      videoTitle,
      videoDescription,
      transcriptText,
      autoSaveNotes: autoSaveNotes === true,
    });
    
    enrichedMessages = [
      {
        role: 'system',
        content: systemContent,
      },
      ...messages,
    ];
  }

    const tokenTracker = createStreamTokenTracker({
      userId: user.id,
      model: 'gpt-4o-mini-2024-07-18',
      provider: 'openai',
      operation: 'chat',
      videoId,
      userVideoId,
    });

    // Only add saveNote tool if autoSaveNotes is enabled
    const tools = autoSaveNotes ? {
      saveNote: tool({
        description: language === 'id' 
          ? 'Simpan catatan penting dari percakapan untuk pengguna. Gunakan ini ketika pengguna meminta untuk menyimpan sesuatu, atau ketika ada informasi penting yang layak dicatat. Timestamp adalah waktu dalam detik di video (gunakan 0 jika tidak relevan dengan waktu tertentu).'
          : 'Save an important note from the conversation for the user. Use this when the user asks to save something, or when there is important information worth noting. Timestamp is the time in seconds in the video (use 0 if not relevant to a specific time).',
        parameters: z.object({
          text: z.string().describe(language === 'id' 
            ? 'Teks catatan yang akan disimpan'
            : 'The note text to save'),
          timestamp: z.number().describe(language === 'id'
            ? 'Waktu dalam detik di video (0 jika tidak relevan)'
            : 'Time in seconds in the video (0 if not relevant)'),
          color: z.enum([
            NOTE_COLORS.yellow,
            NOTE_COLORS.blue,
            NOTE_COLORS.green,
            NOTE_COLORS.red,
            NOTE_COLORS.purple,
          ]).describe(language === 'id'
            ? 'Warna catatan: yellow, blue, green, red, atau purple'
            : 'Note color: yellow, blue, green, red, or purple'),
        }),
        execute: async ({ text, timestamp, color }) => {
          // Save the note when the tool is invoked
          try {
            // Check if user has pro plan (monthly or yearly)
            const currentPlan = await UserPlanService.getCurrentPlan(user.id);
            if (currentPlan === 'free') {
              console.log('[saveNote tool] User does not have pro plan, skipping note save');
              return { 
                success: false, 
                error: 'pro_plan_required',
                message: 'Saving notes is only available for pro users. Please upgrade your plan to use this feature.' 
              };
            }

            const timestampValue = Number(timestamp);
            console.log('[saveNote tool] Received:', { text, timestamp, color, timestampValue });
            
            const note = await NoteRepository.create({
              userId: user.id,
              userVideoId,
              timestamp: timestampValue,
              text,
              color: color as typeof NOTE_COLORS[keyof typeof NOTE_COLORS],
            });
            
            console.log('[saveNote tool] Saved note:', { id: note.id, timestamp: note.timestamp });
            return { success: true, noteId: note.id, savedTimestamp: note.timestamp };
          } catch (err) {
            console.error('Failed to save note from tool call:', err);
            return { success: false, error: 'Failed to save note' };
          }
        },
      }),
    } : undefined;

    const result = streamText({
      model: openai('gpt-4o-mini-2024-07-18'),
      // model: google('gemini-2.0-flash-001'),
      messages: enrichedMessages,
      ...(tools && { tools, maxSteps: 5 }), // Allow multiple steps so streaming continues after tool calls
      onFinish: async (data) => {
        // Save assistant messages
        data.steps.forEach(async (item) => {
          try {
            await MessageRepository.create({
              userVideoId,
              content: item.text,
              role: 'assistant',
              timestamp: Math.floor(Date.now() / 1000),
            });
          } catch (err) {
            console.error('Failed to save assistant message:', err);
          }
        });

        // Note: Tool calls are now handled in the execute function of the tool definition
        // No need to handle them here in onFinish
        
        // Track token usage
        await tokenTracker.onFinish(data);
      },
      onError: (error) => {
        console.error('Streaming error:', error);
      }
    });

    return result.toDataStreamResponse();
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
