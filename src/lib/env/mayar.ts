import { env } from "@/lib/env/server";

export type MayarEnv = {
  apiKey: string;
  apiBase: string;
  productId: string;
  tierIdMonthly: string;
  tierIdYearly: string;
  webhookToken: string;
};

export function assertMayarEnv(): MayarEnv {
  const apiKey = env.MAYAR_API_KEY ?? process.env.MAYAR_API_KEY;
  const apiBase = env.MAYAR_API_BASE ?? process.env.MAYAR_API_BASE;
  const productId = env.MAYAR_PRODUCT_ID ?? process.env.MAYAR_PRODUCT_ID;
  const tierIdMonthly =
    env.MAYAR_TIER_ID_MONTHLY ?? process.env.MAYAR_TIER_ID_MONTHLY;
  const tierIdYearly =
    env.MAYAR_TIER_ID_YEARLY ?? process.env.MAYAR_TIER_ID_YEARLY;
  const webhookToken =
    env.MAYAR_WEBHOOK_TOKEN ?? process.env.MAYAR_WEBHOOK_TOKEN;

  const missing: string[] = [];
  if (!apiKey) missing.push("MAYAR_API_KEY");
  if (!apiBase) missing.push("MAYAR_API_BASE");
  if (!productId) missing.push("MAYAR_PRODUCT_ID");
  if (!tierIdMonthly) missing.push("MAYAR_TIER_ID_MONTHLY");
  if (!tierIdYearly) missing.push("MAYAR_TIER_ID_YEARLY");
  if (!webhookToken) missing.push("MAYAR_WEBHOOK_TOKEN");

  if (missing.length > 0) {
    throw new Error(`Missing Mayar env: ${missing.join(", ")}`);
  }

  return {
    apiKey: apiKey!,
    apiBase: apiBase!.replace(/\/$/, ""),
    productId: productId!,
    tierIdMonthly: tierIdMonthly!,
    tierIdYearly: tierIdYearly!,
    webhookToken: webhookToken!,
  };
}
