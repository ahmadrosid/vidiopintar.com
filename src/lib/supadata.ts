import { Supadata } from '@supadata/js';
import { env } from '@/lib/env/server';

export const supadata = new Supadata({
  apiKey: env.SUPADATA_API_KEY,
});
