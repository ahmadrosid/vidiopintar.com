"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/payment/copy-button";
import { formatDisplayDateTime } from "@/lib/utils";
import { transactionStatusLabel } from "@/lib/transaction-status-labels";

const planNames = new Map<string, string>([
  ["monthly", "Paket bulanan"],
  ["yearly", "Paket tahunan"],
]);

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

interface TransactionDetailDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onTransactionUpdate?: (updatedTransaction: Transaction) => void;
  currentPaymentSettings: PaymentSettings;
}

const ctaClass =
  "inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover disabled:cursor-not-allowed disabled:opacity-50";

export function TransactionDetailDialog({
  transaction,
  isOpen,
  onClose,
  onTransactionUpdate,
  currentPaymentSettings
}: TransactionDetailDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localUpdate, setLocalUpdate] = useState<Transaction | null>(null);

  const currentTransaction =
    transaction && localUpdate?.id === transaction.id ? localUpdate : transaction;

  const updateTransactionStatus = async (status: string) => {
    if (!currentTransaction) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/transactions/${currentTransaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      const updatedTransaction = await response.json();
      setLocalUpdate(updatedTransaction);
      onTransactionUpdate?.(updatedTransaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      // TODO: Add error handling/toast notification
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWhatsAppClick = async () => {
    if (currentTransaction?.status === 'pending') {
      await updateTransactionStatus('waiting_confirmation');
    }
  };

  if (!currentTransaction) return null;

  // Use stored bank details for transaction integrity, current WhatsApp number for an up-to-date contact
  let storedPaymentSettings: any = null;

  try {
    if (currentTransaction.paymentSettings) {
      storedPaymentSettings = JSON.parse(currentTransaction.paymentSettings);
    }
  } catch (error) {
    console.error('Error parsing stored payment settings:', error);
  }

  const bankDetails = {
    bankName: storedPaymentSettings?.bankName || currentPaymentSettings.bankName,
    accountNumber: storedPaymentSettings?.bankAccountNumber || currentPaymentSettings.bankAccountNumber,
    accountName: storedPaymentSettings?.bankAccountName || currentPaymentSettings.bankAccountName,
    whatsappPhone: currentPaymentSettings.whatsappPhoneNumber
  };

  const planName = planNames.get(currentTransaction.planType) ?? currentTransaction.planType;

  const whatsappMessage = `Halo, saya sudah melakukan transfer untuk ${planName} sebesar ${formatAmount(currentTransaction.amount, currentTransaction.currency)}.\n\nReferensi Transaksi: ${currentTransaction.transactionReference}\n\nMohon konfirmasi pembayaran saya.`;
  const whatsappUrl = `https://wa.me/${bankDetails.whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-none border-site-line bg-site-panel font-mono text-site-text">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-site-text">Detail transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-site-text-muted">Paket</span>
              <span className="capitalize text-site-text">{currentTransaction.planType}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-site-text-muted">Jumlah</span>
              <span className="text-site-text">{formatAmount(currentTransaction.amount, currentTransaction.currency)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-site-text-muted">Status</span>
              <span className={`border px-2 py-0.5 text-xs ${getStatusClass(currentTransaction.status)}`}>
                {transactionStatusLabel(currentTransaction.status)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-site-text-muted">Dibuat</span>
              <span className="text-site-text-2">{formatDate(currentTransaction.createdAt)}</span>
            </div>

            {currentTransaction.expiresAt && currentTransaction.status === 'pending' && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-site-text-muted">Berakhir</span>
                <span className="text-site-text-2">{formatDate(currentTransaction.expiresAt)}</span>
              </div>
            )}
          </div>

          {currentTransaction.status === 'waiting_confirmation' && (
            <div className="flex items-start gap-3 border border-site-line bg-site-header p-4 text-sm">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mt-0.5 size-5 shrink-0 text-site-accent" />
              <div>
                <p className="mb-1 font-semibold text-site-text">Konfirmasi pembayaran terkirim</p>
                <p className="text-site-text-2">
                  Konfirmasi pembayaranmu sudah dikirim ke tim kami. Kami akan memverifikasi dan mengonfirmasi pembayaranmu segera.
                </p>
              </div>
            </div>
          )}

          {currentTransaction.status === 'pending' && (
            <>
              <div className="space-y-4 border-t border-site-line pt-4 text-sm">
                <h3 className="font-display text-lg font-bold text-site-text">Informasi pembayaran</h3>
                <div>
                  <p className="mb-1 text-xs text-site-text-muted">Nama bank</p>
                  <p className="text-site-text">{bankDetails.bankName}</p>
                </div>

                <div>
                  <p className="mb-1 text-xs text-site-text-muted">Nama rekening</p>
                  <p className="text-site-text">{bankDetails.accountName}</p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs text-site-text-muted">Nomor rekening</p>
                    <p className="text-site-text">{bankDetails.accountNumber}</p>
                  </div>
                  <CopyButton text={bankDetails.accountNumber} fieldId="account" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs text-site-text-muted">Jumlah transfer</p>
                    <p className="text-site-text">{formatAmount(currentTransaction.amount, currentTransaction.currency)}</p>
                  </div>
                  <CopyButton text={currentTransaction.amount.toString()} fieldId="amount" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs text-site-text-muted">Referensi</p>
                    <p className="text-site-text">{currentTransaction.transactionReference}</p>
                  </div>
                  <CopyButton text={currentTransaction.transactionReference} fieldId="reference" />
                </div>
              </div>

              <div className="border-t border-site-line pt-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  aria-disabled={isUpdating}
                  className={ctaClass}
                >
                  {isUpdating ? "Memperbarui..." : "Konfirmasi pembayaran lewat WhatsApp"}
                </a>
                <p className="mt-2 text-center text-xs text-site-text-faint">Kirim konfirmasi setelah transfer</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
