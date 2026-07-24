import type { Transaction } from "@/lib/db/schema/transactions";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Prefer subscriptionEndsAt (Mayar). Fall back to confirmedAt + period for
 * legacy rows without a stored end date (no backfill).
 */
export function getSubscriptionEndsAt(tx: {
  planType: string;
  confirmedAt: Date | null;
  subscriptionEndsAt?: Date | null;
}): Date | null {
  if (tx.subscriptionEndsAt) {
    return new Date(tx.subscriptionEndsAt);
  }

  if (!tx.confirmedAt) return null;

  const confirmedDate = new Date(tx.confirmedAt);
  if (tx.planType === "monthly") {
    return new Date(confirmedDate.getTime() + 30 * DAY_MS);
  }
  if (tx.planType === "yearly") {
    return new Date(confirmedDate.getTime() + 365 * DAY_MS);
  }
  return null;
}

export function isTransactionActive(
  tx: Pick<Transaction, "status" | "planType" | "confirmedAt" | "subscriptionEndsAt">,
  now = new Date(),
): boolean {
  if (tx.status !== "confirmed") return false;
  const endsAt = getSubscriptionEndsAt(tx);
  if (!endsAt) return false;
  return now <= endsAt;
}
