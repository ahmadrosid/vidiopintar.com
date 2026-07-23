import { describe, expect, it } from "vitest";
import { uniqueMayarEmail } from "./email";
import { buildWebhookDedupKey, isPaidStatus } from "./paid-status";
import { extractMemberIdFromCreateResponse } from "./client";

describe("uniqueMayarEmail", () => {
  it("plus-addresses the local part", () => {
    expect(uniqueMayarEmail("user@example.com", "abc-123")).toBe(
      "user+abc-123@example.com",
    );
  });

  it("rejects invalid email", () => {
    expect(() => uniqueMayarEmail("not-an-email", "id")).toThrow("Invalid email");
  });
});

describe("isPaidStatus", () => {
  it("accepts paid/success/true", () => {
    expect(isPaidStatus(true)).toBe(true);
    expect(isPaidStatus("paid")).toBe(true);
    expect(isPaidStatus("SUCCESS")).toBe(true);
  });

  it("rejects unpaid values", () => {
    expect(isPaidStatus(false)).toBe(false);
    expect(isPaidStatus("pending")).toBe(false);
    expect(isPaidStatus(undefined)).toBe(false);
  });
});

describe("buildWebhookDedupKey", () => {
  it("prefers delivery id", () => {
    expect(
      buildWebhookDedupKey({
        event: "payment.received",
        deliveryId: "del-1",
        mayarTransactionId: "tx",
      }),
    ).toBe("delivery:del-1");
  });

  it("falls back to composite key", () => {
    expect(
      buildWebhookDedupKey({
        event: "payment.received",
        mayarMemberId: "m1",
        mayarTransactionId: "t1",
        occurredAt: "2026-01-01",
      }),
    ).toBe("payment.received|m1|t1|2026-01-01");
  });
});

describe("extractMemberIdFromCreateResponse", () => {
  it("reads nested membershipCustomer.memberId", () => {
    expect(
      extractMemberIdFromCreateResponse({
        membershipCustomer: { memberId: "mem-1" },
      }),
    ).toBe("mem-1");
  });

  it("returns undefined when missing", () => {
    expect(extractMemberIdFromCreateResponse({})).toBeUndefined();
  });
});
