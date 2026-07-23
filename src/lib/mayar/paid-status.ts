export function isPaidStatus(status: string | boolean | undefined): boolean {
  if (status === true) return true;
  if (typeof status !== "string") return false;
  const normalized = status.toLowerCase();
  return normalized === "paid" || normalized === "success";
}

export function buildWebhookDedupKey(input: {
  event: string;
  deliveryId?: string | null;
  mayarTransactionId?: string | null;
  mayarMemberId?: string | null;
  occurredAt?: string | null;
}): string {
  if (input.deliveryId) {
    return `delivery:${input.deliveryId}`;
  }

  return [
    input.event,
    input.mayarMemberId ?? "",
    input.mayarTransactionId ?? "",
    input.occurredAt ?? "",
  ].join("|");
}
