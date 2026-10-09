// Token pricing per 1M tokens in USD, keyed by "provider:model".
interface ModelPrice {
  readonly input: number;
  readonly output: number;
}

export interface TokenCost {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

const PRICING_BY_MODEL = new Map<string, ModelPrice>([
  // $0.14 per 1M input tokens (cache miss), $0.28 per 1M output tokens
  ["deepseek:deepseek-v4-flash", { input: 0.14, output: 0.28 }],
]);

const roundMicro = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

export function calculateTokenCost(
  provider: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): TokenCost {
  const pricing = PRICING_BY_MODEL.get(`${provider}:${model}`);

  if (!pricing) {
    console.warn(`No pricing found for ${provider}:${model}`);

    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return {
    inputCost: roundMicro(inputCost),
    outputCost: roundMicro(outputCost),
    totalCost: roundMicro(inputCost + outputCost),
  };
}
