'use client';

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TransactionWithUser } from '@/lib/db/schema/transactions';
import { TransactionsTableFilters } from '@/components/admin/transactions-table-filters';
import { TransactionTableRowActions } from '@/components/admin/transaction-table-row-actions';

interface TransactionsTableProps {
  transactions: TransactionWithUser[];
  onUpdate: () => void;
}

const STATUS_BADGE_VARIANTS = {
  pending: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
  waiting_confirmation: { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
  confirmed: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
  cancelled: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
  expired: { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
};

const shortDateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string) {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    });
    currencyFormatters.set(currency, formatter);
  }
  return formatter;
}

function getStatusBadge(status: string) {
  const config = STATUS_BADGE_VARIANTS[status as keyof typeof STATUS_BADGE_VARIANTS] || STATUS_BADGE_VARIANTS.expired;

  return (
    <Badge variant={config.variant} className={`${config.color} text-xs`}>
      {status === 'waiting_confirmation' ? 'pending confirmation' : status.replace('_', ' ')}
    </Badge>
  );
}

function formatAmount(amount: number, currency: string) {
  return getCurrencyFormatter(currency).format(amount);
}

function formatDate(date: string | Date) {
  return shortDateTimeFormatter.format(new Date(date));
}

function formatSubscriptionExpiry(transaction: TransactionWithUser) {
  const { status, confirmedAt, planType, expiresAt } = transaction;

  if (status === 'pending' || status === 'waiting_confirmation') {
    if (!expiresAt) return { text: '-', color: 'text-gray-400', fullDate: null };

    const expireDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expireDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = diffMs / (1000 * 60);

    if (diffMs <= 0) {
      return {
        text: 'Payment Expired',
        color: 'text-red-600 font-medium',
        fullDate: formatDate(expireDate),
      };
    }

    let text: string;
    let color = 'text-gray-600';

    if (diffHours < 2) {
      color = 'text-red-600 font-medium';
      if (diffMinutes < 60) {
        text = `Payment expires in ${Math.max(1, Math.round(diffMinutes))}m`;
      } else {
        text = `Payment expires in ${Math.round(diffHours * 10) / 10}h`;
      }
    } else if (diffHours < 6) {
      color = 'text-orange-600 font-medium';
      text = `Payment expires in ${Math.round(diffHours)}h`;
    } else if (diffHours < 24) {
      text = `Payment expires in ${Math.round(diffHours)}h`;
    } else {
      const days = Math.round(diffHours / 24);
      text = `Payment expires in ${days}d`;
    }

    return { text, color, fullDate: formatDate(expireDate) };
  }

  if (status === 'confirmed' && confirmedAt) {
    const confirmedDate = new Date(confirmedAt);
    const now = new Date();

    let subscriptionExpiry: Date;
    if (planType === 'monthly') {
      subscriptionExpiry = new Date(confirmedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (planType === 'yearly') {
      subscriptionExpiry = new Date(confirmedDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    } else {
      return { text: '-', color: 'text-gray-400', fullDate: null };
    }

    const diffMs = subscriptionExpiry.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs <= 0) {
      return {
        text: 'Subscription Expired',
        color: 'text-red-600 font-medium',
        fullDate: formatDate(subscriptionExpiry),
      };
    }

    let text: string;
    let color = 'text-green-600';

    if (diffDays < 7) {
      color = 'text-orange-600 font-medium';
      text = `${Math.ceil(diffDays)} days left`;
    } else if (diffDays < 30) {
      text = `${Math.ceil(diffDays)} days left`;
    } else if (planType === 'monthly') {
      text = `${Math.ceil(diffDays)} days left`;
    } else {
      const months = Math.floor(diffDays / 30);
      const remainingDays = Math.ceil(diffDays % 30);
      if (months > 0) {
        text = months === 1 ? '1 month left' : `${months} months left`;
        if (remainingDays > 0) {
          text += ` ${remainingDays}d`;
        }
      } else {
        text = `${Math.ceil(diffDays)} days left`;
      }
    }

    return { text, color, fullDate: formatDate(subscriptionExpiry) };
  }

  return { text: '-', color: 'text-gray-400', fullDate: null };
}

export function TransactionsTable({ transactions, onUpdate }: TransactionsTableProps) {
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    planType: 'all',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleConfirm = async (transactionId: string) => {
    setProcessingIds(prev => new Set(prev).add(transactionId));

    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to confirm transaction');
      }

      toast.success('Transaction confirmed');
      onUpdate();
    } catch (error) {
      console.error('Error confirming transaction:', error);
      toast.error('Failed to confirm transaction');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  const handleCancel = async (transactionId: string) => {
    setProcessingIds(prev => new Set(prev).add(transactionId));

    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel transaction');
      }

      toast.success('Transaction cancelled');
      onUpdate();
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast.error('Failed to cancel transaction');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const statusMatch = filters.status === 'all' || transaction.status === filters.status;
      const planMatch = filters.planType === 'all' || transaction.planType === filters.planType;
      const searchMatch = filters.search === '' ||
        transaction.transactionReference.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.user?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.user?.email?.toLowerCase().includes(filters.search.toLowerCase());

      return statusMatch && planMatch && searchMatch;
    });
  }, [transactions, filters]);

  const uniqueStatuses = ['all', ...new Set(transactions.map(t => t.status))];
  const uniquePlanTypes = ['all', ...new Set(transactions.map(t => t.planType))];
  const hasActiveFilters = filters.status !== 'all' || filters.planType !== 'all' || filters.search !== '';

  if (transactions.length === 0) {
    return (
      <Card className="rounded-xs shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No transactions</h3>
            <p className="text-muted-foreground text-sm">
              Transactions will appear here when users make payments.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-xs shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
      <TransactionsTableFilters
        filters={filters}
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        uniqueStatuses={uniqueStatuses}
        uniquePlanTypes={uniquePlanTypes}
        filteredCount={filteredTransactions.length}
        totalCount={transactions.length}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onResetFilters={() => setFilters({ status: 'all', planType: 'all', search: '' })}
        onFiltersChange={setFilters}
      />
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-card/50 hover:bg-card/85 transition-colors duration-200">
              <TableHead className="font-medium min-w-[120px] dark:text-white">Reference</TableHead>
              <TableHead className="font-medium min-w-[150px] dark:text-white">User</TableHead>
              <TableHead className="font-medium min-w-[80px] dark:text-white">Plan</TableHead>
              <TableHead className="font-medium min-w-[100px] dark:text-white">Amount</TableHead>
              <TableHead className="font-medium min-w-[80px] dark:text-white">Status</TableHead>
              <TableHead className="font-medium min-w-[140px] dark:text-white">Subscription Expires</TableHead>
              <TableHead className="font-medium min-w-[120px] dark:text-white">Created</TableHead>
              <TableHead className="w-[100px] dark:text-white"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No transactions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => {
                const expiry = formatSubscriptionExpiry(transaction);

                return (
                  <TableRow
                    key={transaction.id}
                    className={`transition-colors duration-200 hover:bg-card/85 ${
                      transaction.status === 'waiting_confirmation'
                        ? 'bg-blue-50/30 dark:bg-blue-900/20 border-l-4 border-l-blue-400'
                        : ''
                    }`}
                  >
                    <TableCell className="font-mono text-sm">
                      <div className="truncate max-w-[120px]">
                        {transaction.transactionReference}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm">
                      {transaction.user ? (
                        <div className="min-w-[150px]">
                          <div className="font-medium">{transaction.user.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {transaction.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No user data</span>
                      )}
                    </TableCell>

                    <TableCell className="text-sm">
                      <span className="capitalize">{transaction.planType}</span>
                    </TableCell>

                    <TableCell className="text-sm font-medium">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>

                    <TableCell className="text-sm">
                      <div className="min-w-[140px]" title={expiry.fullDate || undefined}>
                        <div className={expiry.color}>
                          {expiry.text}
                        </div>
                        {expiry.fullDate && (
                          <div className="text-xs text-gray-400">
                            {expiry.fullDate}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      <div className="min-w-[120px]">
                        {formatDate(transaction.createdAt!)}
                        {transaction.confirmedAt && (
                          <div className="text-xs text-green-600">
                            Confirmed {formatDate(transaction.confirmedAt)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <TransactionTableRowActions
                        transaction={transaction}
                        processingIds={processingIds}
                        formatAmount={formatAmount}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
