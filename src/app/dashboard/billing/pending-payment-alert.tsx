"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CreditCard, Clock } from "lucide-react";
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
  return `${currency} ${amount.toLocaleString()}`;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
  return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
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
      <Card className="border-none bg-orange-50 dark:bg-orange-950 rounded-xs">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                  {"Selesaikan Pembayaran"}
                </h3>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  {localTransactions.length} {"menunggu"}
                </Badge>
              </div>
              
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                Kamu memiliki {localTransactions.length} pembayaran yang tertunda. Selesaikan langganan untuk mengakses semua fitur.
              </p>

              {/* Latest transaction details */}
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4 border border-orange-200 dark:border-orange-800">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{"Paket"}</p>
                    <p className="font-medium capitalize">{latestTransaction.planType} Plan</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">{"Jumlah"}</p>
                    <p className="font-medium">{formatAmount(latestTransaction.amount, latestTransaction.currency)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {latestTransaction.expiresAt ? "Berakhir" : "Dibuat"}
                    </p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <p className="font-medium">
                        {latestTransaction.expiresAt 
                          ? getTimeRemaining(latestTransaction.expiresAt)
                          : formatDate(latestTransaction.createdAt)
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => handleCompletePayment(latestTransaction)}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {latestTransaction.status === 'waiting_confirmation' ? "Lihat Status" : "Selesaikan Pembayaran"}
                </Button>
                
                {localTransactions.length > 1 && (
                  <p className="text-xs text-orange-700 dark:text-orange-300 flex items-center">
                    + {localTransactions.length - 1} transaksi tertunda lainnya di riwayat bawah
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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