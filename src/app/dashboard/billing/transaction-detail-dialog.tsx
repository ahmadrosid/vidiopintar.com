"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDisplayDateTime } from "@/lib/utils";
import { transactionStatusLabel } from "@/lib/transaction-status-labels";

const planNames = new Map<string, string>([
  ["monthly", "Paket Bulanan"],
  ["yearly", "Paket Tahunan"],
]);

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("id-ID")}`;
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

function DetailRow({ label, value, copyValue }: { label: string; value: string; copyValue?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-site-line-soft py-4">
      <div className="min-w-0">
        <p className="text-xs text-site-text-muted">{label}</p>
        <p className="truncate font-mono text-site-text">{value}</p>
      </div>
      {copyValue && (
        <CopyButton content={copyValue} copyMessage={"Disalin!"} label="Salin" className="text-site-text-muted" />
      )}
    </div>
  );
}

export function TransactionDetailDialog({
  transaction,
  isOpen,
  onClose,
  currentPaymentSettings
}: TransactionDetailDialogProps) {
  const currentTransaction = transaction;

  if (!currentTransaction) return null;

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
  const amountLabel = formatAmount(currentTransaction.amount, currentTransaction.currency);

  const whatsappMessage = `Halo, saya sudah melakukan transfer untuk ${planName} sebesar ${amountLabel}.\n\nReferensi Transaksi: ${currentTransaction.transactionReference}\n\nMohon konfirmasi pembayaran saya.`;
  const whatsappUrl = `https://wa.me/${bankDetails.whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-none border-site-line bg-site-panel font-mono text-site-text">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-site-text">Selesaikan transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm text-site-text-muted">{planName}</p>
            <p className="font-display text-3xl font-extrabold tracking-tight text-site-text">{amountLabel}</p>
          </div>

          <p className="text-sm text-site-text-muted">
            {transactionStatusLabel(currentTransaction.status)} · Dibuat {formatDate(currentTransaction.createdAt)}
            {currentTransaction.expiresAt && currentTransaction.status === 'pending' && ` · Berakhir ${formatDate(currentTransaction.expiresAt)}`}
          </p>

          {(currentTransaction.status === 'pending' || currentTransaction.status === 'waiting_confirmation') && (
            <>
              <div>
                <DetailRow label="Bank" value={`${bankDetails.bankName} · ${bankDetails.accountName}`} />
                <DetailRow label="Rekening" value={bankDetails.accountNumber} copyValue={bankDetails.accountNumber} />
                <DetailRow label="Referensi" value={currentTransaction.transactionReference} copyValue={currentTransaction.transactionReference} />
              </div>

              <p className="text-sm text-site-text-2">
                Transfer tepat {amountLabel} dan tulis kode referensi di berita transfer.
              </p>

              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ctaClass}
                >
                  Saya sudah transfer
                </a>
                <p className="text-center text-xs text-site-text-muted">Kami verifikasi dan aktifkan langganan dalam 24 jam.</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
