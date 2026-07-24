import { PLAN_CONFIGS, type PlanType } from "@/lib/validations/payment";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { UserPlanService } from "@/lib/user-plan-service";
import { assertMayarEnv } from "@/lib/env/mayar";
import { createMemberInvoice, registerMember } from "@/lib/mayar/client";
import { uniqueMayarEmail } from "@/lib/mayar/email";
import {
  logPaymentFailure,
  logPaymentSuccess,
  paymentLogger,
} from "@/lib/utils/logger";

export async function createMayarCheckout(input: {
  userId: string;
  email: string;
  name: string;
  planType: PlanType;
  mobile?: string;
}): Promise<{
  checkoutUrl: string;
  transactionId: string;
  entitlementId: string;
}> {
  assertMayarEnv();

  const canPurchase = await UserPlanService.canPurchasePlan(
    input.userId,
    input.planType,
  );
  if (!canPurchase.canPurchase) {
    throw new Error(canPurchase.reason ?? "cannot_purchase");
  }

  const plan = PLAN_CONFIGS[input.planType];
  let pending = await transactionsRepository.getPendingTransactionByUserAndPlan(
    input.userId,
    input.planType,
  );

  if (
    pending?.membershipBillUrl &&
    pending.mayarMemberId &&
    pending.mayarTransactionId &&
    (!pending.expiresAt || pending.expiresAt > new Date())
  ) {
    return {
      checkoutUrl: pending.membershipBillUrl,
      transactionId: pending.mayarTransactionId,
      entitlementId: pending.id,
    };
  }

  if (pending && !pending.membershipBillUrl) {
    await transactionsRepository.updateStatus(pending.id, "expired");
    pending = null;
  }

  if (!pending) {
    pending = await transactionsRepository.create({
      userId: input.userId,
      planType: input.planType,
      amount: plan.amount,
      currency: "IDR",
      paymentMethod: "mayar",
      transactionReference: await transactionsRepository.generateUniqueReference(),
    });
  }

  const mayarEmail = uniqueMayarEmail(input.email, pending.id);

  try {
    const { memberId } = await registerMember({
      name: input.name,
      email: mayarEmail,
      mobile: input.mobile,
      planType: input.planType,
    });

    const { transactionId, membershipBillUrl } =
      await createMemberInvoice(memberId);

    await transactionsRepository.attachMayarIds(pending.id, {
      mayarMemberId: memberId,
      mayarTransactionId: transactionId,
      mayarMemberEmail: mayarEmail,
      membershipBillUrl,
    });

    logPaymentSuccess("mayar_checkout_created", {
      userId: input.userId,
      transactionId: pending.id,
      planType: input.planType,
      amount: plan.amount,
    });

    return {
      checkoutUrl: membershipBillUrl,
      transactionId,
      entitlementId: pending.id,
    };
  } catch (error) {
    await transactionsRepository.updateStatus(pending.id, "failed");
    logPaymentFailure("mayar_checkout", error, {
      userId: input.userId,
      transactionId: pending.id,
      planType: input.planType,
    });
    paymentLogger.error("Mayar checkout failed", error);
    throw error;
  }
}
