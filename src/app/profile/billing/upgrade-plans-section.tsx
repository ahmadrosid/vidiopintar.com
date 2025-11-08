"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Crown,
  Calendar,
  ArrowUpRight,
  Check,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UpgradePlansSectionProps {
  currentPlan: "free" | "monthly" | "yearly";
  userId?: string;
}

interface ActiveSubscription {
  planType: string;
  expiresAt: string;
}

export function UpgradePlansSection({
  currentPlan,
  userId,
}: UpgradePlansSectionProps) {
  const t = useTranslations("pricing");
  const tBilling = useTranslations("billing");
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    Record<string, ActiveSubscription>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const checkActiveSubscriptions = async () => {
      try {
        const subscriptionChecks = await Promise.all([
          fetch(`/api/user/can-purchase-plan?plan=monthly`).then((res) =>
            res.json()
          ),
          fetch(`/api/user/can-purchase-plan?plan=yearly`).then((res) =>
            res.json()
          ),
        ]);

        const subscriptions: Record<string, ActiveSubscription> = {};

        if (
          !subscriptionChecks[0]?.canPurchase &&
          subscriptionChecks[0]?.activeSubscription
        ) {
          subscriptions.monthly = subscriptionChecks[0].activeSubscription;
        }

        if (
          !subscriptionChecks[1]?.canPurchase &&
          subscriptionChecks[1]?.activeSubscription
        ) {
          subscriptions.yearly = subscriptionChecks[1].activeSubscription;
        }

        setActiveSubscriptions(subscriptions);
      } catch (error) {
        console.error("Failed to check active subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    checkActiveSubscriptions();
  }, [userId]);

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

  const planDetails = {
    monthly: {
      id: "monthly",
      name: t("plans.monthly.name"),
      price: "IDR 50,000",
      period: t("plans.monthly.period"),
      description: t("plans.monthly.description"),
      icon: Calendar,
      color: "text-blue-500",
      popular: false,
      originalPrice: undefined,
      features: [
        t("plans.monthly.features.unlimited"),
        t("plans.monthly.features.ai"),
        t("plans.monthly.features.summaries"),
        t("plans.monthly.features.support"),
      ],
    },
    yearly: {
      id: "yearly",
      name: t("plans.yearly.name"),
      price: "IDR 500,000",
      originalPrice: "IDR 600,000",
      period: t("plans.yearly.period"),
      description: t("plans.yearly.description"),
      icon: Crown,
      color: "text-yellow-500",
      popular: true,
      features: [
        t("plans.yearly.features.unlimited"),
        t("plans.yearly.features.ai"),
        t("plans.yearly.features.summaries"),
        t("plans.yearly.features.support"),
        t("plans.yearly.features.priority"),
      ],
    },
  };

  if (availableUpgrades.length === 0) {
    return (
      <Card className="bg-card border-none shadow-[0px_6px_20px_2px_#00000033] rounded-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Crown className="h-5 w-5 text-yellow-500" />
            {tBilling("currentPlan.premiumTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-foreground text-[0.9375rem]">
            {tBilling("currentPlan.premiumDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full rounded-xs font-semibold border-b-2 border-x-1 border-[#00AAB6] text-[0.9375rem] shadow-[inset_0px_0.5px_1px_0px_#88F8FF,0px_6px_20px_2px_#000000] active:shadow-none active:scale-[0.975] transition-all duration-200 ease-in-out cursor-pointer"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {tBilling("upgrade.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-4xl! max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-semibold tracking-tight text-primary">
            {tBilling("upgrade.title")}
          </DialogTitle>
          <p className="text-secondary-foreground text-base pt-2">
            {tBilling("upgrade.subtitle")}
          </p>
        </DialogHeader>

        <div className="flex gap-2.5 flex-wrap lg:flex-nowrap mt-6">
          {availableUpgrades.map((planId) => {
            const plan = planDetails[planId as keyof typeof planDetails];
            return (
              <Card
                key={planId}
                className={`flex flex-col gap-7 bg-card px-7 py-8 rounded-xs border-none min-h-[472px] w-full hover:bg-card/85 transition relative ${
                  plan.popular ? "shadow-[0px_6px_20px_2px_#00000033]" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute flex gap-2 text-sm text-[#D1CDFF] font-medium top-4 -right-2 pl-4 pr-3 py-2 bg-[#6155F5] border-x-[2px] border-b-2 border-[#463CBC] rounded-sm shadow-[inset_0px_0.5px_1px_0px_rgba(255,255,255,0.4),0px_4px_8px_1px_#000000]">
                    <Sparkles
                      fill="#D1CDFF"
                      className="size-4 text-[#D1CDFF] drop-shadow-[0px_1px_2px_#5047C9]"
                    />
                    <span className="drop-shadow-[0px_1px_2px_#5047C9] select-none">
                      {t("popular")}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-7 relative">
                  <div className="text-[0.9375rem] text-primary uppercase relative">
                    <div className="h-5 w-[3px] -ml-7 -mb-[22px] bg-accent text-primary" />
                    {plan.name}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2 text-4xl font-semibold text-primary">
                      {plan.price}
                      {plan.originalPrice && (
                        <div className="text-base text-secondary-foreground font-normal line-through mt-2.5">
                          {plan.originalPrice}
                        </div>
                      )}
                    </div>
                    <div className="text-secondary-foreground text-[0.9375rem]">
                      {plan.period}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="text-secondary-foreground text-[0.9375rem] mb-1">
                      What's included:
                    </div>
                    {plan.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 text-[0.9375rem] text-primary"
                      >
                        <Check className="size-4 text-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {activeSubscriptions[plan.id] ? (
                  <div className="space-y-3 mt-auto">
                    <div className="bg-card/50 border-2 border-dashed border-orange-500 rounded-xs p-3">
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500" />
                        <div>
                          <p className="font-semibold">Active Subscription</p>
                          <p className="text-xs mt-1 text-secondary-foreground">
                            Expires:{" "}
                            {new Date(
                              activeSubscriptions[plan.id].expiresAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full rounded-xs"
                      size="lg"
                      disabled
                      variant="secondary"
                    >
                      Already Subscribed
                    </Button>
                  </div>
                ) : (
                  <Link
                    href={`/payment?plan=${plan.id}`}
                    className="block mt-auto"
                  >
                    <Button
                      className="w-full cursor-pointer rounded-xs font-semibold border-b-2 border-x-1 border-[#00AAB6] text-[0.9375rem] shadow-[inset_0px_0.5px_1px_0px_#88F8FF,0px_6px_20px_2px_#000000] active:shadow-none active:scale-[0.975] transition-all duration-200 ease-in-out"
                      size="lg"
                    >
                      {tBilling("upgrade.upgradeTo")} {plan.name}
                      <ArrowUpRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
