import { deepseek } from '@ai-sdk/deepseek';

export const AI_MODEL_ID = 'deepseek-v4-flash' as const;
export const AI_PROVIDER = 'deepseek' as const;

export const aiModel = deepseek(AI_MODEL_ID);

export const aiProviderOptions = {
  deepseek: {
    thinking: { type: 'disabled' as const },
  },
};
