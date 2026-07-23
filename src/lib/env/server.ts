import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import 'dotenv/config';

export const env = createEnv({
  server: {
    API_BASE_URL: z.string().url().default("https://api.ahmadrosid.com"),
    API_X_HEADER_API_KEY: z.string().min(1),
    NODE_ENV: z.string().min(1),
    SQLITE_DATABASE_PATH: z
      .string()
      .min(1)
      .default(
        process.env.NODE_ENV === "production"
          ? "/data/vidiopintar.db"
          : "./data/vidiopintar.db",
      ),
    ADMIN_MASTER_EMAIL: z.string().email(),
    TRANSCRIPT_API_KEY: z.string().min(1),
    YOUTUBE_API_KEY: z.string().min(1).optional(),
    MAYAR_API_KEY: z.string().min(1).optional(),
    MAYAR_API_BASE: z.url().optional(),
    MAYAR_PRODUCT_ID: z.string().min(1).optional(),
    MAYAR_TIER_ID_MONTHLY: z.string().min(1).optional(),
    MAYAR_TIER_ID_YEARLY: z.string().min(1).optional(),
    MAYAR_WEBHOOK_TOKEN: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().min(1).default("http://localhost:3000"),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation: true,
});
