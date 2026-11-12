import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
  server: {
    ADMIN_MASTER_EMAIL: z.email(),
    APIFY_API_TOKEN: z.string().min(1).optional(),
  },
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {},
  skipValidation: true,
});
