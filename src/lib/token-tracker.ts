import { TokenUsageRepository } from '@/lib/db/repository';
import { calculateTokenCost } from './token-pricing';

export interface TokenUsageData {
  userId: string;
  model: string;
  provider: 'openai' | 'google';
  operation: 'chat' | 'summary' | 'quick_start_questions';
  inputTokens: number;
  outputTokens: number;
  videoId?: string;
  userVideoId?: number;
  requestDuration?: number;
}

export async function trackTokenUsage(data: TokenUsageData) {
  const totalTokens = data.inputTokens + data.outputTokens;
  const costs = calculateTokenCost(data.provider, data.model, data.inputTokens, data.outputTokens);
  
  try {
    await TokenUsageRepository.create({
      userId: data.userId,
      model: data.model,
      provider: data.provider,
      operation: data.operation,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens,
      inputCost: costs.inputCost.toString(),
      outputCost: costs.outputCost.toString(),
      totalCost: costs.totalCost.toString(),
      videoId: data.videoId,
      userVideoId: data.userVideoId,
      requestDuration: data.requestDuration,
    });
    
    console.log(`Token usage tracked: ${data.operation} - ${totalTokens} tokens - $${costs.totalCost.toFixed(6)}`);
  } catch (error) {
    console.error('Failed to track token usage:', error);
  }
}

// Helper function to create a token tracker for streamText
export function createStreamTokenTracker(baseData: Omit<TokenUsageData, 'inputTokens' | 'outputTokens'>) {
  return {
    onFinish: async (result: any) => {
      if (result.usage) {
        await trackTokenUsage({
          ...baseData,
          inputTokens: result.usage.promptTokens || 0,
          outputTokens: result.usage.completionTokens || 0,
        });
      }
    }
  };
}

// Helper function to track generateText usage
export async function trackGenerateTextUsage(
  result: any,
  baseData: Omit<TokenUsageData, 'inputTokens' | 'outputTokens'>
) {
  if (result.usage) {
    await trackTokenUsage({
      ...baseData,
      inputTokens: result.usage.promptTokens || 0,
      outputTokens: result.usage.completionTokens || 0,
    });
  }
}