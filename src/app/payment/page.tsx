import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { PLAN_CONFIGS } from "@/lib/validations/payment";
import { UserPlanService } from "@/lib/user-plan-service";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { MayarCheckoutButton } from "@/components/payment/mayar-checkout-button";
import { ChevronLeft, AlertTriangle } from "lucide-react";

interface PaymentPageProps {
  searchParams: Promise<{ plan?: string }>;
}

const PLAN_DETAILS = {
  monthly: {
    name: PLAN_CONFIGS.monthly.name,
    price: `IDR ${PLAN_CONFIGS.monthly.amount.toLocaleString("en-US")}`,
    amount: PLAN_CONFIGS.monthly.amount,
  },
  yearly: {
    name: PLAN_CONFIGS.yearly.name,
    price: `IDR ${PLAN_CONFIGS.yearly.amount.toLocaleString("en-US")}`,
    amount: PLAN_CONFIGS.yearly.amount,
  },
} as const;

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const [{ plan }, t, user] = await Promise.all([
    searchParams,
    getTranslations("payment"),
    getCurrentUser(),
  ]);

  const validPlan =
    plan && (plan === "monthly" || plan === "yearly") ? plan : "monthly";
  const currentPlan = PLAN_DETAILS[validPlan];

  const [canPurchaseCheck, existingTransaction] = await Promise.all([
    UserPlanService.canPurchasePlan(user.id, validPlan),
    transactionsRepository.getPendingTransactionByUserAndPlan(
      user.id,
      validPlan,
    ),
  ]);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-6">
          <Link
            href="/home"
            className="text-foreground hover:underline hover:text-accent transition-colors inline-flex gap-2 items-center"
          >
            <ChevronLeft className="size-4" />
            Home
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium mb-2">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {canPurchaseCheck &&
          !canPurchaseCheck.canPurchase &&
          canPurchaseCheck.reason === "already_have_active_subscription" && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                    Active Subscription Found
                  </p>
                  <p className="text-red-800 dark:text-red-200 mb-3">
                    You already have an active paid subscription. Finish or wait
                    for it to expire before purchasing again.
                  </p>
                  {canPurchaseCheck.activeSubscription && (
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Current plan: {canPurchaseCheck.activeSubscription.planType}.
                      Expires:{" "}
                      {canPurchaseCheck.activeSubscription.expiresAt.toLocaleDateString(
                        "en-US",
                        { timeZone: "Asia/Jakarta" },
                      )}
                    </p>
                  )}
                  <div className="mt-4">
                    <Link
                      href="/profile/billing"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 dark:text-red-200 dark:bg-red-800 dark:border-red-600 dark:hover:bg-red-700 transition-colors"
                    >
                      View My Subscription
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

        {existingTransaction?.membershipBillUrl && (
          <p className="text-sm text-muted-foreground text-center mb-6">
            {t("existingPayment")}
          </p>
        )}

        {(!canPurchaseCheck || canPurchaseCheck.canPurchase) && (
          <div className="bg-card border rounded-lg p-6 space-y-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-medium">{currentPlan.name}</h2>
              <p className="text-lg font-semibold">{currentPlan.price}</p>
            </div>

            <p className="text-sm text-muted-foreground">
              Pay securely with Mayar (QRIS, bank transfer, or e-wallet). Access
              unlocks after payment is confirmed.
            </p>

            {existingTransaction?.membershipBillUrl ? (
              <a
                href={existingTransaction.membershipBillUrl}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Continue payment on Mayar
              </a>
            ) : (
              <MayarCheckoutButton
                planType={validPlan}
                label={`Pay ${currentPlan.price} with Mayar`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
