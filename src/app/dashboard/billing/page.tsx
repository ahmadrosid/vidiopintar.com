import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon, CrownIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { getCurrentUser } from "@/lib/auth";
import { DashboardTitle } from "../dashboard-sidebar";
import { Row } from "@/components/site/site-page";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { getPaymentSettings } from "@/lib/validations/payment";
import { UserPlanService } from "@/lib/user-plan-service";
import { TransactionHistory } from "./transaction-history";
import { PendingPaymentAlert } from "./pending-payment-alert";
import { CurrentPlanCard } from "./current-plan-card";
import { UpgradePlansSection } from "./upgrade-plans-section";

export default async function BillingPage() {
  const user = await getCurrentUser();

  // Get user's transaction history
  let transactions: any[] = [];
  try {
    transactions = await transactionsRepository.getByUserId(user.id, 20);
  } catch (error) {
    console.log('Could not get user transactions:', error);
  }

  // Find pending and waiting confirmation transactions
  const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'waiting_confirmation');

  // Determine current plan using UserPlanService (checks for expiration)
  const currentPlan = await UserPlanService.getCurrentPlan(user.id);

  // Get subscription details for the current plan
  let subscriptionDetails = null;
  if (currentPlan !== 'free') {
    const activeSubscription = await UserPlanService.hasActiveSubscription(user.id, currentPlan);
    if (activeSubscription.hasActive && activeSubscription.expiresAt) {
      subscriptionDetails = {
        expiresAt: activeSubscription.expiresAt,
        transaction: activeSubscription.transaction
      };
    }
  }

  const currentPaymentSettings = getPaymentSettings();

  const [monthlyCheck, yearlyCheck] = await Promise.all([
    UserPlanService.canPurchasePlan(user.id, "monthly"),
    UserPlanService.canPurchasePlan(user.id, "yearly"),
  ]);

  const activeSubscriptions: Record<string, { planType: string; expiresAt: string | Date }> = {};
  if (!monthlyCheck.canPurchase && monthlyCheck.activeSubscription) {
    activeSubscriptions.monthly = monthlyCheck.activeSubscription;
  }
  if (!yearlyCheck.canPurchase && yearlyCheck.activeSubscription) {
    activeSubscriptions.yearly = yearlyCheck.activeSubscription;
  }

  return (
    <>
      <DashboardTitle>Tagihan</DashboardTitle>

      {pendingTransactions.length > 0 && (
        <div className="mb-10">
          <PendingPaymentAlert
            transactions={pendingTransactions}
            currentPaymentSettings={currentPaymentSettings}
          />
        </div>
      )}

      <div className="[&>section:first-child]:border-t-0">
        <Row label="Paket saat ini" icon={<HugeiconsIcon icon={CrownIcon} />} wide>
          <CurrentPlanCard currentPlan={currentPlan} subscriptionDetails={subscriptionDetails} />
        </Row>

        <Row label="Upgrade" icon={<HugeiconsIcon icon={SparklesIcon} />} wide>
          <UpgradePlansSection currentPlan={currentPlan} activeSubscriptions={activeSubscriptions} />
        </Row>

        <Row label="Riwayat transaksi" icon={<HugeiconsIcon icon={Clock01Icon} />} wide>
          <TransactionHistory transactions={transactions} currentPaymentSettings={currentPaymentSettings} />
        </Row>
      </div>
    </>
  );
}
