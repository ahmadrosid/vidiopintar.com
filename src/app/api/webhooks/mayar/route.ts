import { NextResponse } from "next/server";
import {
  processMayarWebhook,
  verifyMayarWebhookToken,
} from "@/lib/mayar/webhook";
import type { MayarWebhookPayload } from "@/lib/mayar/types";
import { paymentLogger } from "@/lib/utils/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!verifyMayarWebhookToken(request.url)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let payload: MayarWebhookPayload;
    try {
      payload = (await request.json()) as MayarWebhookPayload;
    } catch {
      return new NextResponse("ok", { status: 200 });
    }

    const result = await processMayarWebhook(payload);
    if (!result.ok && result.retry) {
      return new NextResponse("retry", { status: 500 });
    }

    return new NextResponse("ok", { status: 200 });
  } catch (error) {
    paymentLogger.error("Mayar webhook handler error", error);
    return new NextResponse("error", { status: 500 });
  }
}
