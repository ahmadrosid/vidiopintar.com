import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60;

import { fetchVideoTranscript, fetchVideoDetails } from '@/lib/youtube';
import { MessageRepository, VideoRepository } from '@/lib/db/repository';

export async function POST(req: Request) {
  const { messages, videoId } = await req.json();

  let transcriptText = '';
  let videoTitle = '';
  let videoDescription = '';

  if (videoId) {
    try {
      const transcriptResult = await fetchVideoTranscript(videoId);
      if (transcriptResult?.segments?.length > 0) {
        transcriptText = transcriptResult.segments.map((seg: any) => seg.text).join(' ');
        if (transcriptText.length > 20000) {
          transcriptText = transcriptText.slice(0, 20000) + '...';
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
          videoId,
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
    const systemContent = [
      `You are an AI assistant helping with a YouTube video.`,
      videoTitle ? `Video Title: ${videoTitle}` : '',
      videoDescription ? `Video Description: ${videoDescription}` : '',
      transcriptText ? `Video Transcript (partial): ${transcriptText}` : '',
      "# Rule",
      "- Always respond in markdown format",
      "- Speak the language that user also speak to you",
      "- If you don't know the answer, say 'I don't know' instead of making it up",
      "- Highlight the important answer in codeblock with three backticks (```)",
      "- After answering user question please add additional question at the end of your answer to keep conversation going forward, the goal is to help user to learn more from this video, give them choise in a list with number."
    ].filter(Boolean).join('\n\n'); 

    enrichedMessages = [
      {
        role: 'system',
        content: systemContent,
      },
      ...messages,
    ];
  }

  const result = streamText({
    model: openai('gpt-4.1-2025-04-14'),
    messages: enrichedMessages,
    onFinish: (data) => {
      data.steps.forEach(async (item) => {
        try {
          await MessageRepository.create({
            videoId,
            content: item.text,
            role: 'assistant',
            timestamp: Math.floor(Date.now() / 1000),
          });
        } catch (err) {
          console.error('Failed to save assistant message:', err);
        }
      })
    }
  });

  return result.toDataStreamResponse();
}
