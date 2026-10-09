"use client";

import { useState } from "react";
import { TransactionDetailDialog } from "./transaction-detail-dialog";
import { formatDisplayDateTime } from "@/lib/utils";
import { transactionStatusLabel } from "@/lib/transaction-status-labels";

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

interface TransactionHistoryProps {
  transactions: Transaction[];
  currentPaymentSettings: PaymentSettings | null;
}

function getStatusClass(status: string) {
  return status === "pending" || status === "waiting_confirmation"
    ? "border-site-accent text-site-accent"
    : "border-site-line text-site-text-muted";
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-US")}`;
}

function formatDate(date: Date) {
  return formatDisplayDateTime(date);
}

const formatDay = (date: Date | string | number) =>
  new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

export function TransactionHistory({ transactions, currentPaymentSettings }: TransactionHistoryProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionOverrides, setTransactionOverrides] = useState<Record<string, Transaction>>({});

  const localTransactions = transactions.map(
    (t) => transactionOverrides[t.id] ?? t
  );

  const isPending = (transaction: Transaction) =>
    transaction.status === "pending" || transaction.status === "waiting_confirmation";

  const handleTransactionClick = (transaction: Transaction) => {
    if (isPending(transaction)) {
      setSelectedTransaction(transaction);
      setIsDialogOpen(true);
    }
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

  if (localTransactions.length === 0) {
    return <p className="text-site-text-muted">Belum ada transaksi.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto border border-site-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-site-header text-site-text-muted">
            <tr>
              <th className="px-4 py-2.5 font-normal">Paket</th>
              <th className="px-4 py-2.5 font-normal">Jumlah</th>
              <th className="px-4 py-2.5 font-normal">Status</th>
              <th className="px-4 py-2.5 font-normal">Dibuat</th>
              <th className="px-4 py-2.5 font-normal">Dikonfirmasi</th>
            </tr>
          </thead>
          <tbody>
            {localTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                onClick={() => handleTransactionClick(transaction)}
                className={`border-t border-site-line ${isPending(transaction) ? "cursor-pointer hover:bg-site-header" : ""}`}
              >
                <td className="whitespace-nowrap px-4 py-2.5 capitalize text-site-text">{transaction.planType}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-site-text tabular-nums">
                  {formatAmount(transaction.amount, transaction.currency)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className={`border px-2 py-0.5 text-xs ${getStatusClass(transaction.status)}`}>
                    {transactionStatusLabel(transaction.status)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-site-text-muted tabular-nums">{formatDay(transaction.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-site-text-muted tabular-nums">
                  {transaction.confirmedAt ? formatDate(transaction.confirmedAt) : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {localTransactions.some(isPending) && (
        <p className="mt-4 text-xs text-site-text-faint">Klik transaksi yang menunggu untuk melihat detail.</p>
      )}

      {currentPaymentSettings && (
        <TransactionDetailDialog
          transaction={selectedTransaction}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onTransactionUpdate={handleTransactionUpdate}
          currentPaymentSettings={currentPaymentSettings}
        />
      )}
    </>
  );
}
