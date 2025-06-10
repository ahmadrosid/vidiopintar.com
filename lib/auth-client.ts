import { createAuthClient } from "better-auth/react";

// Use the actual URL of your application in production
const baseURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});
