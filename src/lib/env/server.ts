import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import 'dotenv/config';

export const env = createEnv({
  server: {
    API_BASE_URL: z.string().url(),
    API_X_HEADER_API_KEY: z.string().min(1),
    NODE_ENV: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_NAME: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    ADMIN_MASTER_EMAIL: z.string().email(),
    // SMTP is optional - only required if you want email login
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.string().min(1).optional(),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASS: z.string().min(1).optional(),
    SMTP_FROM: z.string().email().optional(),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: process.env,
  skipValidation: process.env.NODE_ENV === "production",
});

// Helper to check if SMTP is configured
export const isSmtpConfigured = () => {
  return !!(
    env.SMTP_HOST &&
    env.SMTP_PORT &&
    env.SMTP_USER &&
    env.SMTP_PASS &&
    env.SMTP_FROM
  );
};
