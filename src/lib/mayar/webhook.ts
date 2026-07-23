import { timingSafeEqual } from "node:crypto";
import { mayarWebhookEventsRepository } from "@/lib/db/repository/mayar-webhook-events";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { assertMayarEnv } from "@/lib/env/mayar";
import { getInvoice } from "@/lib/mayar/client";
import { buildWebhookDedupKey, isPaidStatus } from "@/lib/mayar/paid-status";
import type { MayarWebhookPayload } from "@/lib/mayar/types";
import {
  logPaymentFailure,
  logPaymentSuccess,
  paymentLogger,
} from "@/lib/utils/logger";

function tokensEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyMayarWebhookToken(url: string): boolean {
  const { webhookToken } = assertMayarEnv();
  const token = new URL(url).searchParams.get("token");
  if (!token) return false;
  return tokensEqual(token, webhookToken);
}

function summarizePayload(payload: MayarWebhookPayload): string {
  return JSON.stringify({
    event: payload.event,
    id: payload.data?.id,
    transactionId: payload.data?.transactionId,
    memberId: payload.data?.memberId,
    status: payload.data?.status,
    transactionStatus: payload.data?.transactionStatus,
    expiredAt: payload.data?.expiredAt,
  });
}

async function findTransaction(input: {
  mayarTransactionId: string | null;
  memberId: string | null;
  customerEmail: string | null;
}) {
  if (input.mayarTransactionId) {
    const byTx = await transactionsRepository.getByMayarTransactionId(
      input.mayarTransactionId,
    );
    if (byTx) return byTx;
  }
  if (input.memberId) {
    const byMember = await transactionsRepository.getByMayarMemberId(
      input.memberId,
    );
    if (byMember) return byMember;
  }
  if (input.customerEmail) {
    return transactionsRepository.getPendingByMayarMemberEmail(
      input.customerEmail,
    );
  }
  return null;
}

export async function processMayarWebhook(
  payload: MayarWebhookPayload,
): Promise<{ ok: boolean; retry?: boolean }> {
  const event = payload.event ?? "unknown";
  const mayarTransactionId =
    payload.data?.transactionId ?? payload.data?.id ?? null;
  const memberId = payload.data?.memberId ?? null;
  const customerEmail = payload.data?.customerEmail ?? null;

  const dedupKey = buildWebhookDedupKey({
    event,
    deliveryId: payload.data?.id ?? null,
    mayarTransactionId,
    mayarMemberId: memberId,
    occurredAt: payload.data?.updatedAt ?? payload.data?.expiredAt ?? null,
  });

  const inserted = await mayarWebhookEventsRepository.tryInsert({
    dedupKey,
    event,
    mayarTransactionId,
    mayarMemberId: memberId,
    payloadSummary: summarizePayload(payload),
  });

  if (!inserted) {
    return { ok: true };
  }

  if (
    event === "payment.received" &&
    mayarTransactionId &&
    (isPaidStatus(payload.data?.transactionStatus) ||
      isPaidStatus(payload.data?.status))
  ) {
    try {
      const invoice = await getInvoice(mayarTransactionId).catch(() => null);
      if (
        invoice &&
        !isPaidStatus(invoice.transactionStatus) &&
        !isPaidStatus(invoice.status)
      ) {
        paymentLogger.warn("Mayar payment.received but invoice not paid", {
          mayarTransactionId,
        });
        return { ok: false, retry: true };
      }

      const periodEnd = payload.data?.expiredAt
        ? new Date(payload.data.expiredAt)
        : null;

      const tx = await findTransaction({
        mayarTransactionId,
        memberId,
        customerEmail,
      });

      if (!tx) {
        paymentLogger.warn("Mayar payment with no matching transaction", {
          mayarTransactionId,
          memberId,
        });
        return { ok: false, retry: true };
      }

      if (tx.status === "confirmed") {
        if (memberId && tx.mayarMemberId && memberId !== tx.mayarMemberId) {
          paymentLogger.warn("Renewal member mismatch; ignoring", {
            transactionId: tx.id,
            memberId,
            expected: tx.mayarMemberId,
          });
          return { ok: true };
        }
        await transactionsRepository.renewSubscription(tx.id, periodEnd);
        logPaymentSuccess("mayar_renewal", {
          transactionId: tx.id,
          userId: tx.userId,
          planType: tx.planType,
        });
        return { ok: true };
      }

      if (tx.status !== "pending" && tx.status !== "processing_failed") {
        return { ok: true };
      }

      await transactionsRepository.confirmMayarPayment(tx.id, {
        mayarTransactionId,
        mayarMemberId: memberId,
        subscriptionEndsAt: periodEnd,
      });

      logPaymentSuccess("mayar_activated", {
        transactionId: tx.id,
        userId: tx.userId,
        planType: tx.planType,
        amount: tx.amount,
      });
      return { ok: true };
    } catch (error) {
      logPaymentFailure("mayar_webhook_payment", error, {
        mayarTransactionId,
      });
      return { ok: false, retry: true };
    }
  }

  if (
    (event === "membership.memberExpired" ||
      event === "membership.memberUnsubscribed") &&
    memberId
  ) {
    const tx = await transactionsRepository.getByMayarMemberId(memberId);
    if (tx) {
      const status =
        event === "membership.memberUnsubscribed" ? "cancelled" : "expired";
      await transactionsRepository.revokeSubscription(tx.id, status);
      logPaymentSuccess("mayar_revoked", {
        transactionId: tx.id,
        userId: tx.userId,
        planType: tx.planType,
      });
    }
  }

  return { ok: true };
}
