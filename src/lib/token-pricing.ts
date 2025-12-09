// Token pricing per 1M tokens in USD - Updated with official 2024/2025 rates
export const TOKEN_PRICING = {
  openai: {
    'gpt-4o-mini-2024-07-18': {
      input: 0.15,   // $0.15 per 1M input tokens (confirmed)
      output: 0.60,  // $0.60 per 1M output tokens (confirmed)
    },
    'gpt-4.1-2025-04-14': {
      input: 2.00,   // $2.00 per 1M input tokens (updated from official pricing)
      output: 8.00,  // $8.00 per 1M output tokens (updated from official pricing)
    },
    'gpt-5-nano': {
      input: 0.05,   // $0.05 per 1M input tokens
      output: 0.40,  // $0.40 per 1M output tokens
    },
  },
  google: {
    'gemini-2.0-flash-001': {
      input: 0.10,   // $0.10 per 1M input tokens (updated - simplified pricing)
      output: 0.10,  // $0.10 per 1M output tokens (simplified pricing - same rate)
    },
  },
} as const;

export function calculateTokenCost(
  provider: keyof typeof TOKEN_PRICING,
  model: string,
  inputTokens: number,
  outputTokens: number
): { inputCost: number; outputCost: number; totalCost: number } {
  const providerPricing = TOKEN_PRICING[provider];
  
  const pricing = providerPricing && model in providerPricing
    ? (providerPricing as any)[model]
    : undefined;
  
  if (!pricing) {
    console.warn(`No pricing found for ${provider}:${model}`);
    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }
  
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  return {
    inputCost: Math.round(inputCost * 1_000_000) / 1_000_000,
    outputCost: Math.round(outputCost * 1_000_000) / 1_000_000,
    totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
  };
}