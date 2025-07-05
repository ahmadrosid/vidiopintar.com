import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { trackGenerateTextUsage } from '@/lib/token-tracker';
import { getCurrentUser } from '@/lib/auth';
import { getSummaryPrompt } from '@/lib/ai/system-prompts';

export async function generateSummary(text: string, language: 'en' | 'id' = 'en', videoId?: string, userVideoId?: number): Promise<string> {
  // Limit the input to the first 4000 words to speedup the generation
  const MAX_WORDS = 4000;
  let truncatedText = text;
  const words = text.split(/\s+/);
  if (words.length > MAX_WORDS) {
    truncatedText = words.slice(0, MAX_WORDS).join(' ');
  }

  const systemPrompt = getSummaryPrompt(language);

    const startTime = Date.now();
    const result = await generateText({
        model: google('gemini-2.0-flash-001'),
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: `INPUT:\n${truncatedText}`
            }
        ]
    });
    
    // Track token usage
    try {
        const user = await getCurrentUser();
        await trackGenerateTextUsage(result, {
            userId: user.id,
            model: 'gemini-2.0-flash-001',
            provider: 'google',
            operation: 'summary',
            videoId,
            userVideoId,
            requestDuration: Date.now() - startTime,
        });
    } catch (error) {
        console.error('Failed to track summary token usage:', error);
    }
    
    return result.text;
}
