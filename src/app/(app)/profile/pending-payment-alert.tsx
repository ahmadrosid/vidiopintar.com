"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CreditCard, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface Transaction {
  id: string;
  planType: string;
  amount: number;
  currency: string;
  status: string;
  transactionReference: string;
  createdAt: Date | null;
  confirmedAt?: Date | null;
  expiresAt?: Date | null;
  membershipBillUrl?: string | null;
  paymentSettings?: string | null;
}

interface PendingPaymentAlertProps {
  transactions: Transaction[];
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: "Asia/Jakarta",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeRemaining(expiresAt: Date) {
  const now = new Date();
  const timeLeft = new Date(expiresAt).getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  if (hoursLeft < 0) return "Expired";
  if (hoursLeft < 1) return "Less than 1 hour";
  if (hoursLeft < 24) return `${hoursLeft} hours left`;

  const daysLeft = Math.floor(hoursLeft / 24);
  return `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`;
}

export function PendingPaymentAlert({ transactions }: PendingPaymentAlertProps) {
  const t = useTranslations("billing.pendingPayment");

  const pendingTransactions = transactions.filter((t) => t.status === "pending");

  if (pendingTransactions.length === 0) {
    return null;
  }

  const latestTransaction = pendingTransactions[0];

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-medium text-orange-900 dark:text-orange-100">
                {t("title")}
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                {t("description")}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium capitalize">
                    {latestTransaction.planType} Plan
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {formatAmount(
                      latestTransaction.amount,
                      latestTransaction.currency,
                    )}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    {latestTransaction.expiresAt
                      ? getTimeRemaining(latestTransaction.expiresAt)
                      : formatDate(latestTransaction.createdAt)}
                  </span>
                </div>
              </div>

              {latestTransaction.membershipBillUrl ? (
                <Button asChild size="sm" variant="outline">
                  <a href={latestTransaction.membershipBillUrl}>
                    Continue on Mayar
                  </a>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline">
                  <a href={`/payment?plan=${latestTransaction.planType}`}>
                    Complete payment
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
