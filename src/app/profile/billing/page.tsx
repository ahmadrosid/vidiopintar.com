import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { getPaymentSettings } from "@/lib/validations/payment";
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

  return (
    <div className="space-y-6">
      <BillingHeader />

      {/* Pending Payment Alert - Show above current plan */}
      {pendingTransactions.length > 0 && (
        <PendingPaymentAlert 
          transactions={pendingTransactions} 
          currentPaymentSettings={currentPaymentSettings}
        />
      )}

      {/* Current Plan Display */}
      <CurrentPlanCard 
        currentPlan={currentPlan} 
        subscriptionDetails={subscriptionDetails}
      />

      {/* Upgrade Plans Section */}
      <UpgradePlansSection currentPlan={currentPlan} userId={user.id} />
      
      <TransactionHistory 
        transactions={transactions} 
        currentPaymentSettings={currentPaymentSettings}
      />
    </div>
  );
}