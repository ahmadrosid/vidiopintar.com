"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MayarCheckoutButton({
  planType,
  label,
}: {
  planType: "monthly" | "yearly";
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/mayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }

      if (!res.ok) {
        let message = "Checkout failed";
        try {
          const errBody = (await res.json()) as { error?: string };
          if (errBody.error) message = errBody.error;
        } catch {
          // ignore non-JSON error bodies
        }
        setError(message);
        return;
      }

      const data = (await res.json()) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!data.checkoutUrl) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="w-full"
        disabled={loading}
        onClick={startCheckout}
      >
        {loading ? "Redirecting…" : label}
      </Button>
      {error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : null}
    </div>
  );
}
