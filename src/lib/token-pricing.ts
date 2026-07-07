// Token pricing per 1M tokens in USD
export const TOKEN_PRICING = {
  deepseek: {
    'deepseek-v4-flash': {
      input: 0.14,   // $0.14 per 1M input tokens (cache miss)
      output: 0.28,  // $0.28 per 1M output tokens
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
