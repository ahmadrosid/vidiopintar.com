"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, CreditCardIcon, Clock01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { TransactionDetailDialog } from "./transaction-detail-dialog";

interface Transaction {
  id: string;
  planType: string;
  amount: number;
  currency: string;
  status: 'pending' | 'waiting_confirmation' | 'confirmed' | 'expired' | 'cancelled';
  transactionReference: string;
  createdAt: Date;
  confirmedAt?: Date | null;
  expiresAt?: Date | null;
  paymentSettings?: string | null;
}

interface PaymentSettings {
  id: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  whatsappPhoneNumber: string;
  whatsappMessageTemplate: string;
}

interface PendingPaymentAlertProps {
  transactions: Transaction[];
  currentPaymentSettings: PaymentSettings;
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function getTimeRemaining(expiresAt: Date) {
  const now = new Date();
  const timeLeft = new Date(expiresAt).getTime() - now.getTime();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));

  if (hoursLeft < 0) return "Kedaluwarsa";

  if (hoursLeft < 1) return "Kurang dari 1 jam";

  if (hoursLeft < 24) return `${hoursLeft} jam lagi`;

  const daysLeft = Math.floor(hoursLeft / 24);

  return `${daysLeft} hari lagi`;
}

export function PendingPaymentAlert({ transactions, currentPaymentSettings }: PendingPaymentAlertProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionOverrides, setTransactionOverrides] = useState<Record<string, Transaction>>({});

  const localTransactions = transactions.map(
    (t) => transactionOverrides[t.id] ?? t
  );

  const handleCompletePayment = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleTransactionUpdate = (updatedTransaction: Transaction) => {
    setTransactionOverrides((prev) => ({
      ...prev,
      [updatedTransaction.id]: updatedTransaction,
    }));
    setSelectedTransaction((prev) =>
      prev?.id === updatedTransaction.id ? updatedTransaction : prev
    );
  };

  // Show the most recent pending transaction prominently
  const latestTransaction = localTransactions[0];

  return (
    <>
      <div className="border border-site-line border-l-2 border-l-site-accent bg-site-panel p-6">
        <div className="flex items-start gap-4">
          <HugeiconsIcon icon={AlertCircleIcon} className="mt-1 size-5 shrink-0 text-site-accent" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h3 className="font-display text-xl font-bold tracking-tight text-site-text">Selesaikan pembayaran</h3>
              <span className="border border-site-accent px-2 py-0.5 text-xs text-site-accent">
                {localTransactions.length} menunggu
              </span>
            </div>

            <p className="mb-4 text-sm text-site-text-2">
              Kamu memiliki {localTransactions.length} pembayaran yang tertunda. Selesaikan langganan untuk mengakses semua fitur.
            </p>

            <div className="mb-4 grid grid-cols-1 gap-4 border-t border-site-line-soft pt-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-site-text-muted">Paket</p>
                <p className="capitalize text-site-text">{latestTransaction.planType}</p>
              </div>
              <div>
                <p className="text-site-text-muted">Jumlah</p>
                <p className="text-site-text">{formatAmount(latestTransaction.amount, latestTransaction.currency)}</p>
              </div>
              <div>
                <p className="text-site-text-muted">{latestTransaction.expiresAt ? "Berakhir" : "Dibuat"}</p>
                <p className="flex items-center gap-1 text-site-text">
                  <HugeiconsIcon icon={Clock01Icon} className="size-3 text-site-text-muted" />
                  {latestTransaction.expiresAt
                    ? getTimeRemaining(latestTransaction.expiresAt)
                    : formatDate(latestTransaction.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => handleCompletePayment(latestTransaction)}
                className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover"
              >
                <HugeiconsIcon icon={CreditCardIcon} className="size-4" />
                {latestTransaction.status === "waiting_confirmation" ? "Lihat status" : "Selesaikan pembayaran"}
              </button>

              {localTransactions.length > 1 && (
                <p className="text-xs text-site-text-muted">
                  + {localTransactions.length - 1} transaksi tertunda lainnya di riwayat bawah
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionDetailDialog
        transaction={selectedTransaction}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onTransactionUpdate={handleTransactionUpdate}
        currentPaymentSettings={currentPaymentSettings}
      />
    </>
  );
}
