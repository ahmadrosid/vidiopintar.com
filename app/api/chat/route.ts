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
    const suggestionPrompt = `
# Generate suggestion

Act as Export prompt engineer.

After answering the user's question about a video, continue the conversation by offering 2-3 suggested prompts:

1. Deepen understanding of the video content
2. Feel natural, as if coming from a fellow viewer
3. Match both the language style of the video transcript and the user's tone
4. Never use words like "I" or "you" in the questions
5. Format suggestion like this: "Here's a quick question to explore the video content:\n1. Question 1\n2. Question 2\n3. Question 3"
`;
    const systemContent = [
      `You are an AI assistant helping with a YouTube video.`,
      videoTitle ? `Video Title: ${videoTitle}` : '',
      videoDescription ? `Video Description: ${videoDescription}` : '',
      transcriptText ? `Video Transcript (partial): ${transcriptText}` : '',
`# RULES
- Use markdown formatting throughout responses
- Match the language used by the user
- Acknowledge knowledge limitations with "I don't know" rather than fabricating information
`
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
