import { generateText } from 'ai';
import { trackGenerateTextUsage } from '@/lib/token-tracker';
import { getCurrentUser } from '@/lib/auth';
import { getSummaryPrompt } from '@/lib/ai/system-prompts';
import { AI_MODEL_ID, AI_PROVIDER, aiModel, aiProviderOptions } from '@/lib/ai/model';

export async function generateSummary(text: string, language: 'en' | 'id' = 'en', videoId?: string, userVideoId?: number): Promise<string> {
  const systemPrompt = getSummaryPrompt(language);

    const startTime = Date.now();
    const result = await generateText({
        model: aiModel,
        providerOptions: aiProviderOptions,
        system: systemPrompt,
        messages: [
            {
                role: 'user',
                content: `INPUT:\n${text}`
            }
        ]
    });
    
    // Track token usage
    try {
        const user = await getCurrentUser();
        await trackGenerateTextUsage(result, {
            userId: user.id,
            model: AI_MODEL_ID,
            provider: AI_PROVIDER,
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
