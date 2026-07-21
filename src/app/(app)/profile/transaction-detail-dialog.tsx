"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/payment/copy-button";

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

export function TransactionDetailDialog({ 
  transaction, 
  isOpen, 
  onClose,
  onTransactionUpdate,
  currentPaymentSettings
}: TransactionDetailDialogProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(transaction);

  // Update local state when transaction prop changes
  useEffect(() => {
    setCurrentTransaction(transaction);
  }, [transaction]);

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
      setCurrentTransaction(updatedTransaction);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'waiting_confirmation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Use current payment settings instead of cached ones
  // For bank details, we can use the stored settings to maintain transaction integrity
  // But for WhatsApp, always use current settings for up-to-date phone number
  let storedPaymentSettings: any = null;
  try {
    if (currentTransaction.paymentSettings) {
      storedPaymentSettings = JSON.parse(currentTransaction.paymentSettings);
    }
  } catch (error) {
    console.error('Error parsing stored payment settings:', error);
  }

  // Use stored bank details for transaction integrity, current WhatsApp for updated phone
  const bankDetails = {
    bankName: storedPaymentSettings?.bankName || currentPaymentSettings.bankName,
    accountNumber: storedPaymentSettings?.bankAccountNumber || currentPaymentSettings.bankAccountNumber,
    accountName: storedPaymentSettings?.bankAccountName || currentPaymentSettings.bankAccountName,
    whatsappPhone: currentPaymentSettings.whatsappPhoneNumber
  };

  const planDetails = {
    monthly: { name: 'Monthly Plan' },
    yearly: { name: 'Yearly Plan' }
  };

  const currentPlan = planDetails[currentTransaction.planType as keyof typeof planDetails] || { name: currentTransaction.planType };

  // WhatsApp message
  const whatsappMessage = `Halo, saya sudah melakukan transfer untuk ${currentPlan.name} sebesar ${formatAmount(currentTransaction.amount, currentTransaction.currency)}.\n\nReferensi Transaksi: ${currentTransaction.transactionReference}\n\nMohon konfirmasi pembayaran saya.`;
  const whatsappUrl = `https://wa.me/${bankDetails.whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Transaction Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan</span>
              <span className="capitalize">{currentTransaction.planType} Plan</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount</span>
              <span className="font-medium">{formatAmount(currentTransaction.amount, currentTransaction.currency)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="secondary" className={getStatusColor(currentTransaction.status)}>
                {currentTransaction.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Created</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(currentTransaction.createdAt)}
              </span>
            </div>

            {currentTransaction.expiresAt && currentTransaction.status === 'pending' && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expires</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(currentTransaction.expiresAt)}
                </span>
              </div>
            )}
          </div>

          {/* Waiting for confirmation message */}
          {currentTransaction.status === 'waiting_confirmation' && (
            <div className="border-t pt-4">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="size-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Payment Confirmation Sent</p>
                    <p className="text-blue-800 dark:text-blue-200">
                      Your payment confirmation has been sent to our admin team. We will verify and confirm your payment shortly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Details - Only show for pending transactions */}
          {currentTransaction.status === 'pending' && (
            <>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Payment Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Bank Name</p>
                    <p className="text-sm">{bankDetails.bankName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account Name</p>
                    <p className="text-sm">{bankDetails.accountName}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                      <p className="font-mono text-sm">{bankDetails.accountNumber}</p>
                    </div>
                    <CopyButton text={bankDetails.accountNumber} fieldId="account" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Amount to Transfer</p>
                      <p className="text-sm font-medium">{formatAmount(currentTransaction.amount, currentTransaction.currency)}</p>
                    </div>
                    <CopyButton text={currentTransaction.amount.toString()} fieldId="amount" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reference</p>
                      <p className="text-sm font-mono">{currentTransaction.transactionReference}</p>
                    </div>
                    <CopyButton text={currentTransaction.transactionReference} fieldId="reference" />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Button 
                  onClick={handleWhatsAppClick}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    {isUpdating ? 'Updating...' : 'Confirm Payment via WhatsApp'}
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Send payment confirmation after transfer
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}