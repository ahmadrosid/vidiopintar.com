import { assertMayarEnv } from "@/lib/env/mayar";
import type { MayarEnvelope, PlanType } from "./types";

async function mayarFetch<T>(
  path: string,
  init?: RequestInit,
  attempt = 0,
): Promise<T> {
  const { apiKey, apiBase } = assertMayarEnv();
  const res = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 429 && attempt < 1) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return mayarFetch<T>(path, init, attempt + 1);
  }

  const body = (await res.json()) as MayarEnvelope<T>;
  const statusCode = body.statusCode ?? res.status;
  if (statusCode >= 400 || !res.ok) {
    const message =
      body.message ??
      (Array.isArray(body.messages) ? body.messages.join(", ") : body.messages) ??
      `Mayar API error (${statusCode})`;
    throw new Error(message);
  }

  if (body.data !== undefined && body.data !== null) return body.data;
  throw new Error("Mayar returned an empty response");
}

export function planToMayarTier(planType: PlanType): {
  membershipTierId: string;
  membershipMonthlyPeriod: 1 | 12;
} {
  const { tierIdMonthly, tierIdYearly } = assertMayarEnv();
  if (planType === "yearly") {
    return {
      membershipTierId: tierIdYearly,
      membershipMonthlyPeriod: 12,
    };
  }
  return {
    membershipTierId: tierIdMonthly,
    membershipMonthlyPeriod: 1,
  };
}

export async function registerMember(input: {
  name: string;
  email: string;
  mobile?: string;
  planType: PlanType;
}) {
  const { productId } = assertMayarEnv();
  const tier = planToMayarTier(input.planType);

  const customerInfo: Record<string, string> = {
    name: input.name,
    email: input.email,
  };
  if (input.mobile) customerInfo.mobile = input.mobile;

  const data = await mayarFetch<Record<string, unknown>>(
    "/memberships/members/create",
    {
      method: "POST",
      body: JSON.stringify({
        productId,
        membershipTierId: tier.membershipTierId,
        membershipMonthlyPeriod: tier.membershipMonthlyPeriod,
        customerInfo,
      }),
    },
  );

  const membershipCustomer = data.membershipCustomer as
    | { memberId?: string; id?: string }
    | undefined;

  const memberId =
    membershipCustomer?.memberId ??
    membershipCustomer?.id ??
    (typeof data.memberId === "string" ? data.memberId : undefined) ??
    (typeof data.id === "string" ? data.id : undefined);

  if (!memberId) {
    throw new Error("Mayar did not return a member id");
  }

  return { memberId };
}

export async function createMemberInvoice(memberId: string) {
  const { productId } = assertMayarEnv();
  const data = await mayarFetch<{
    transactionId?: string;
    id?: string;
    membershipBillUrl?: string;
    link?: string;
  }>(`/memberships/members/${memberId}/invoice/create`, {
    method: "POST",
    body: JSON.stringify({ productId }),
  });

  const transactionId = data.transactionId ?? data.id;
  const membershipBillUrl = data.membershipBillUrl ?? data.link;
  if (!transactionId || !membershipBillUrl) {
    throw new Error("Mayar did not return checkout details");
  }
  return { transactionId, membershipBillUrl };
}

export async function getInvoice(invoiceOrTransactionId: string) {
  return mayarFetch<{ status?: string; transactionStatus?: string }>(
    `/invoices/${invoiceOrTransactionId}`,
  );
}

export function extractMemberIdFromCreateResponse(
  data: Record<string, unknown>,
): string | undefined {
  const membershipCustomer = data.membershipCustomer as
    | { memberId?: string; id?: string }
    | undefined;
  return (
    membershipCustomer?.memberId ??
    membershipCustomer?.id ??
    (typeof data.memberId === "string" ? data.memberId : undefined) ??
    (typeof data.id === "string" ? data.id : undefined)
  );
}
