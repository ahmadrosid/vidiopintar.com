import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { UserPlanService } from "@/lib/user-plan-service";
import { TransactionHistory } from "../transaction-history";
import { PendingPaymentAlert } from "../pending-payment-alert";
import { CurrentPlanCard } from "./current-plan-card";
import { UpgradePlansSection } from "./upgrade-plans-section";
import { BillingHeader } from "./billing-header";

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  let transactions: Awaited<
    ReturnType<typeof transactionsRepository.getByUserId>
  > = [];
  try {
    transactions = await transactionsRepository.getByUserId(user.id, 20);
  } catch (error) {
    console.log("Could not get user transactions:", error);
  }

  const pendingTransactions = transactions.filter((t) => t.status === "pending");

  const currentPlan = await UserPlanService.getCurrentPlan(user.id);

  let subscriptionDetails = null;
  if (currentPlan !== "free") {
    const activeSubscription = await UserPlanService.hasActiveSubscription(
      user.id,
      currentPlan,
    );
    if (activeSubscription.hasActive && activeSubscription.expiresAt) {
      subscriptionDetails = {
        expiresAt: activeSubscription.expiresAt,
        transaction: activeSubscription.transaction,
      };
    }
  }

  return (
    <div className="space-y-6">
      <BillingHeader />

      {pendingTransactions.length > 0 && (
        <PendingPaymentAlert transactions={pendingTransactions} />
      )}

      <CurrentPlanCard
        currentPlan={currentPlan}
        subscriptionDetails={subscriptionDetails}
      />

      <UpgradePlansSection currentPlan={currentPlan} userId={user.id} />

      <TransactionHistory transactions={transactions} />
    </div>
  );
}
