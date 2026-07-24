'use client';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Check, X } from 'lucide-react';
import type { TransactionWithUser } from '@/lib/db/schema/transactions';

interface TransactionTableRowActionsProps {
  transaction: TransactionWithUser;
  processingIds: Set<string>;
  formatAmount: (amount: number, currency: string) => string;
  onConfirm: (transactionId: string) => void;
  onCancel: (transactionId: string) => void;
}

export function TransactionTableRowActions({
  transaction,
  processingIds,
  formatAmount,
  onConfirm,
  onCancel,
}: TransactionTableRowActionsProps) {
  if (transaction.status !== 'pending' && transaction.status !== 'waiting_confirmation') {
    return null;
  }

  return (
    <div className="flex gap-1">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={`h-8 w-8 p-0 transition-colors duration-200 ${
              transaction.status === 'waiting_confirmation'
                ? 'text-accent hover:text-accent hover:bg-accent/15 ring-2 ring-accent/30'
                : 'text-accent hover:text-accent hover:bg-accent/10'
            }`}
            disabled={processingIds.has(transaction.id)}
            title={transaction.status === 'waiting_confirmation' ? 'Payment confirmation received - Click to confirm' : 'Confirm transaction'}
          >
            <Check className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to confirm this transaction?
            </AlertDialogDescription>
            <div className="bg-muted rounded-lg p-4 space-y-3 border">
              {transaction.user && (
                <div>
                  <span className="text-sm text-muted-foreground">User:</span>
                  <div className="font-medium">{transaction.user.name}</div>
                  <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Amount:</span>
                <div className="font-semibold text-lg">{formatAmount(transaction.amount, transaction.currency)}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Plan:</span>
                <div className="font-medium capitalize">{transaction.planType}</div>
              </div>
            </div>
            {transaction.status === 'waiting_confirmation' && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <div className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                  Payment confirmation received from user
                </div>
                <div className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                  The user has indicated they have sent the payment and are waiting for admin verification.
                </div>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onConfirm(transaction.id)}>
              Confirm Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50/85 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 transition-colors duration-200"
            disabled={processingIds.has(transaction.id)}
            title="Cancel transaction"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this transaction?
            </AlertDialogDescription>
            <div className="bg-muted rounded-lg p-4 space-y-3 border">
              {transaction.user && (
                <div>
                  <span className="text-sm text-muted-foreground">User:</span>
                  <div className="font-medium">{transaction.user.name}</div>
                  <div className="text-sm text-muted-foreground">{transaction.user.email}</div>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Amount:</span>
                <div className="font-semibold text-lg">{formatAmount(transaction.amount, transaction.currency)}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Plan:</span>
                <div className="font-medium capitalize">{transaction.planType}</div>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="text-red-800 dark:text-red-200 text-sm font-medium">
                Cancelling transaction
              </div>
              <div className="text-red-700 dark:text-red-300 text-xs mt-1">
                The transaction will be marked as cancelled and the user will not receive access to the plan.
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onCancel(transaction.id)}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
