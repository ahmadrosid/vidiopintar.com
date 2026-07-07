import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import 'dotenv/config';

export const env = createEnv({
  server: {
    API_BASE_URL: z.string().url().default("https://api.ahmadrosid.com"),
    API_X_HEADER_API_KEY: z.string().min(1),
    NODE_ENV: z.string().min(1),
    SQLITE_DATABASE_PATH: z.string().min(1),
    BETTER_AUTH_URL: z.string().min(1),
    ADMIN_MASTER_EMAIL: z.string().email(),
    TRANSCRIPT_API_KEY: z.string().min(1),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
  skipValidation: true,
});
