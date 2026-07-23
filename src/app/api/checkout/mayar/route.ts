import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth";
import { createMayarCheckout } from "@/lib/mayar/checkout";
import { PLAN_CONFIGS, type PlanType } from "@/lib/validations/payment";
import {
  getSanitizedRequestMetadata,
  logPaymentFailure,
  paymentLogger,
} from "@/lib/utils/logger";

export async function POST(request: Request) {
  const requestMetadata = await getSanitizedRequestMetadata(request);

  try {
    const user = await getOptionalUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { planType?: string };
    const planType = body.planType as PlanType | undefined;

    if (!planType || !(planType in PLAN_CONFIGS)) {
      return NextResponse.json(
        { error: "planType must be monthly or yearly" },
        { status: 400 },
      );
    }

    const result = await createMayarCheckout({
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split("@")[0] || "Customer",
      planType,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    if (
      message === "already_have_active_subscription" ||
      message === "cannot_purchase" ||
      message === "free_plan_cannot_be_purchased"
    ) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    logPaymentFailure("mayar_checkout_api", error, { requestMetadata });
    paymentLogger.error("Mayar checkout API error", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
