"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, CrownIcon, SparklesIcon, Alert01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { formatDisplayDate } from "@/lib/utils";

interface UpgradePlansSectionProps {
  currentPlan: "free" | "monthly" | "yearly";
  activeSubscriptions: Record<string, ActiveSubscription>;
}

interface ActiveSubscription {
  planType: string;
  expiresAt: string | Date;
}

const ctaClass =
  "inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

const planDetails = {
  monthly: {
    id: "monthly",
    name: "Bulanan",
    price: "IDR 50,000",
    period: "per bulan",
    description: "Sempurna untuk memulai",
    popular: false,
    originalPrice: undefined,
    features: [
      "Pemrosesan video tanpa batas",
      "Wawasan bertenaga AI",
      "Ringkasan instan",
      "Kuis tanpa batas",
      "Dukungan email",
    ],
  },
  yearly: {
    id: "yearly",
    name: "Tahunan",
    price: "IDR 500,000",
    originalPrice: "IDR 600,000",
    period: "per tahun",
    description: "Nilai terbaik untuk pembelajar yang berkomitmen",
    popular: true,
    features: [
      "Pemrosesan video tanpa batas",
      "Wawasan bertenaga AI",
      "Ringkasan instan",
      "Kuis tanpa batas",
      "Dukungan email",
      "Dukungan prioritas",
    ],
  },
};

export function UpgradePlansSection({
  currentPlan,
  activeSubscriptions,
}: UpgradePlansSectionProps) {
  const getAvailableUpgrades = () => {
    if (currentPlan === "yearly" && activeSubscriptions.yearly) {
      return [];
    }
    if (currentPlan === "monthly" && activeSubscriptions.monthly) {
      return ["yearly"];
    }
    return ["monthly", "yearly"];
  };

  const availableUpgrades = getAvailableUpgrades();

  if (availableUpgrades.length === 0) {
    return (
      <div className="flex items-start gap-3">
        <HugeiconsIcon icon={CrownIcon} className="mt-1 size-5 shrink-0 text-site-accent" />
        <div>
          <p className="font-semibold text-site-text">Kamu sudah di paket premium!</p>
          <p className="text-sm text-site-text-muted">Kamu memakai paket tertinggi kami dengan semua fitur tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={`${ctaClass} w-auto`}>
          <HugeiconsIcon icon={SparklesIcon} className="size-4" />
          Upgrade paket
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl! overflow-y-auto rounded-none border-site-line bg-site-panel font-mono text-site-text">
        <DialogHeader>
          <DialogTitle className="font-display text-4xl font-extrabold tracking-tight text-site-text">
            Upgrade paket
          </DialogTitle>
          <p className="pt-2 text-sm text-site-text-muted">Dapatkan akses ke lebih banyak fitur dan buka potensi penuh kamu.</p>
        </DialogHeader>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {availableUpgrades.map((planId) => {
            const plan = planDetails[planId as keyof typeof planDetails];
            const active = activeSubscriptions[plan.id];
            return (
              <div
                key={planId}
                className={`flex flex-col gap-6 border bg-site-bg p-6 ${plan.popular ? "border-site-accent" : "border-site-line"}`}
              >
                {plan.popular && (
                  <span className="self-start bg-site-accent-soft px-2 py-1 text-xs text-site-accent">Paling populer</span>
                )}

                <div>
                  <p className="border-l-2 border-site-accent pl-3 text-sm uppercase text-site-text-muted">{plan.name}</p>
                  <div className="mt-3 flex flex-wrap items-baseline gap-3">
                    <span className="font-display text-3xl font-extrabold tracking-tight text-site-text sm:text-4xl">{plan.price}</span>
                    {plan.originalPrice && <span className="text-sm text-site-text-muted line-through">{plan.originalPrice}</span>}
                  </div>
                  <p className="mt-1 text-sm text-site-text-muted">{plan.period}</p>
                  <p className="mt-3 text-sm text-site-text-2">{plan.description}</p>
                </div>

                <ul className="flex flex-col gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-site-text">
                      <HugeiconsIcon icon={CheckIcon} className="size-4 shrink-0 text-site-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {active ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 border border-dashed border-site-accent p-3 text-sm">
                        <HugeiconsIcon icon={Alert01Icon} className="mt-0.5 size-4 shrink-0 text-site-accent" />
                        <div>
                          <p className="font-semibold text-site-text">Langganan aktif</p>
                          <p className="mt-1 text-xs text-site-text-muted">Berakhir: {formatDisplayDate(active.expiresAt)}</p>
                        </div>
                      </div>
                      <button type="button" disabled className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center border border-site-line text-site-text-muted">
                        Sudah berlangganan
                      </button>
                    </div>
                  ) : (
                    <Link href={`/payment?plan=${plan.id}`} className={ctaClass}>
                      Upgrade ke {plan.name}
                      <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
