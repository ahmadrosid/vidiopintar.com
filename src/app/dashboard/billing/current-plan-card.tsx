'use client';

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { formatDisplayDate } from "@/lib/utils";

interface SubscriptionDetails {
  expiresAt: Date;
  transaction: any;
}

interface CurrentPlanCardProps {
  currentPlan: 'monthly' | 'yearly';
  subscriptionDetails?: SubscriptionDetails | null;
}

function getDaysUntilExpiry(date: Date) {
  const now = new Date();
  const expiry = new Date(date);
  const timeDiff = expiry.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
}

const planDetails = {
  monthly: {
    name: "Bulanan",
    price: "IDR 50,000",
    period: "per bulan",
    features: [
      "Pemrosesan video tanpa batas",
      "Wawasan bertenaga AI",
      "Ringkasan instan",
      "Dukungan email",
    ],
  },
  yearly: {
    name: "Tahunan",
    price: "IDR 500,000",
    period: "per tahun",
    features: [
      "Pemrosesan video tanpa batas",
      "Wawasan bertenaga AI",
      "Ringkasan instan",
      "Dukungan email",
      "Dukungan prioritas",
    ],
  },
};

export function CurrentPlanCard({ currentPlan, subscriptionDetails }: CurrentPlanCardProps) {
  const plan = planDetails[currentPlan];
  const daysLeft = subscriptionDetails ? getDaysUntilExpiry(subscriptionDetails.expiresAt) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-4xl font-extrabold leading-none tracking-tight text-site-text sm:text-5xl">{plan.price}</p>
          <p className="mt-2 text-sm text-site-text-muted">{plan.period}</p>
        </div>
        <span className="border border-site-accent px-3 py-1 text-sm text-site-accent">{plan.name}</span>
      </div>

      {subscriptionDetails && (
        <div className="border border-site-line bg-site-panel p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 text-site-text">
            <HugeiconsIcon icon={Clock01Icon} className="size-4 text-site-accent" />
            <span className="font-semibold">Status langganan</span>
          </div>
          <p className="text-site-text-2">Berakhir pada {formatDisplayDate(subscriptionDetails.expiresAt)}</p>
          <p className="mt-1 text-site-text-muted">{daysLeft > 0 ? `${daysLeft} hari lagi` : "Sudah berakhir"}</p>
        </div>
      )}

      {plan.features.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-site-text-muted">Fitur paket</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-site-text">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4 shrink-0 text-site-accent" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
