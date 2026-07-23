import { describe, expect, it } from "vitest";
import { getSubscriptionEndsAt, isTransactionActive } from "./subscription";

describe("getSubscriptionEndsAt", () => {
  it("prefers subscriptionEndsAt", () => {
    const ends = new Date("2026-08-01T00:00:00Z");
    expect(
      getSubscriptionEndsAt({
        planType: "monthly",
        confirmedAt: new Date("2026-07-01T00:00:00Z"),
        subscriptionEndsAt: ends,
      })?.toISOString(),
    ).toBe(ends.toISOString());
  });

  it("falls back to confirmedAt + period", () => {
    const confirmedAt = new Date("2026-07-01T00:00:00Z");
    const ends = getSubscriptionEndsAt({
      planType: "monthly",
      confirmedAt,
      subscriptionEndsAt: null,
    });
    expect(ends?.getTime()).toBe(confirmedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  });
});

describe("isTransactionActive", () => {
  it("is active when endsAt is in the future", () => {
    const now = new Date("2026-07-15T00:00:00Z");
    expect(
      isTransactionActive(
        {
          status: "confirmed",
          planType: "monthly",
          confirmedAt: new Date("2026-07-01T00:00:00Z"),
          subscriptionEndsAt: new Date("2026-08-01T00:00:00Z"),
        },
        now,
      ),
    ).toBe(true);
  });

  it("is inactive when expired", () => {
    const now = new Date("2026-08-02T00:00:00Z");
    expect(
      isTransactionActive(
        {
          status: "confirmed",
          planType: "monthly",
          confirmedAt: new Date("2026-07-01T00:00:00Z"),
          subscriptionEndsAt: new Date("2026-08-01T00:00:00Z"),
        },
        now,
      ),
    ).toBe(false);
  });
});
