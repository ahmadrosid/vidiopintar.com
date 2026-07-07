import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

export const AI_MODEL_ID = 'deepseek-v4-flash';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatWithTranscriptOptions {
  transcript: string;
  question: string;
  history?: ChatMessage[];
  language?: 'en' | 'id';
}

/**
 * Chats with a YouTube video transcript using DeepSeek.
 */
export async function chatWithTranscript({
  transcript,
  question,
  history = [],
  language = 'en',
}: ChatWithTranscriptOptions): Promise<string> {
  // Truncate transcript if too long (keep last ~6000 words to manage token usage)
  const words = transcript.split(/\s+/);
  const maxWords = 6000;
  const truncatedTranscript = words.length > maxWords 
    ? words.slice(-maxWords).join(' ')
    : transcript;

  // Build system prompt based on language
  const systemPrompt = language === 'id'
    ? `Kamu adalah asisten AI yang membantu menjawab pertanyaan tentang video YouTube berdasarkan transkrip video.

Transkrip Video:
${truncatedTranscript}

# Panduan Komunikasi
- Gunakan format markdown dalam semua respons
- Respon dalam Bahasa Indonesia
- Hanya gunakan informasi dari transkrip di atas untuk menjawab pertanyaan
- Jika informasi tidak ada dalam transkrip, akui dengan "Saya tidak tahu" atau "Informasi ini tidak disebutkan dalam video"
- Gunakan paragraf pendek dan format yang mudah dibaca
- Gunakan **bold** untuk poin penting
- Gunakan bullet points untuk daftar`
    : `You are an AI assistant helping answer questions about a YouTube video based on the video transcript.

Video Transcript:
${truncatedTranscript}

# Communication Guidelines
- Use markdown formatting throughout responses
- Respond in English
- Only use information from the transcript above to answer questions
- If information is not in the transcript, acknowledge with "I don't know" or "This information is not mentioned in the video"
- Use short paragraphs and easy-to-read formatting
- Use **bold** for important points
- Use bullet points for lists`;

  // Build conversation history
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // Add recent history (last 5 exchanges to avoid token limits)
  const recentHistory = history.slice(-10); // Keep last 10 messages (5 exchanges)
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current question
  messages.push({ role: 'user', content: question });

  try {
    const result = await generateText({
      model: deepseek(AI_MODEL_ID),
      providerOptions: {
        deepseek: {
          thinking: { type: 'disabled' },
        },
      },
      messages,
      temperature: 0.7,
    });

    return result.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
    throw new Error('Failed to get AI response: Unknown error');
  }
}
