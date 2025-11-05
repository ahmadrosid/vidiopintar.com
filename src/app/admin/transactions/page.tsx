import { AdminNavigation } from '@/components/admin/admin-navigation';
import { TransactionsClientWrapper } from '@/components/admin/transactions-client-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { transactionsRepository } from '@/lib/db/repository/transactions';
import { requireAdmin } from '@/lib/auth-admin';
import type { TransactionWithUser } from '@/lib/db/schema/transactions';

async function getTransactions(): Promise<TransactionWithUser[]> {
  await requireAdmin();
  return await transactionsRepository.getAll(100);
}

export default async function AdminTransactionsPage() {
  const transactions = await getTransactions();

  // Calculate stats
  const pending = transactions.filter(t => t.status === 'pending' || t.status === 'waiting_confirmation').length;
  const confirmed = transactions.filter(t => t.status === 'confirmed').length;
  const total = transactions.length;
  const totalRevenue = transactions
    .filter(t => t.status === 'confirmed')
    .reduce((sum, t) => sum + t.amount, 0);
  const conversionRate = total > 0 ? (confirmed / total) * 100 : 0;

  return (
    <main className="bg-accent dark:bg-background">
      <div className="container max-w-[1328px] w-full mx-auto py-8 px-4">
        <AdminNavigation
          title="Transaction Management"
          description="Payment transactions and revenue monitoring"
          currentPath="/admin/transactions"
        />

        {/* Transaction Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pending}</div>
              <p className="text-xs text-muted-foreground">
                Pending confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmed}</div>
              <p className="text-xs text-muted-foreground">
                Successfully processed
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">
                All-time transactions
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Confirmed payments only
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Confirmed to total ratio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <TransactionsClientWrapper 
          initialTransactions={transactions}
        />
      </div>
    </main>
  );
}