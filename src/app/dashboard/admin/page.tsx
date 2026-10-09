import Link from "next/link";
import { requireAdmin } from "@/lib/auth-admin";
import { getAdminAnalytics, ADMIN_ANALYTICS_RANGES, type AdminAnalyticsRange } from "@/lib/admin/analytics";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { Stat } from "@/components/site/site-page";
import { DashboardTitle } from "../dashboard-sidebar";
import { cancelTransactionAction } from "./actions";
import { ConfirmTransactionButton } from "./confirm-transaction-button";
import { TrendChart, type TrendSeries } from "./trend-chart";
import { transactionStatusLabel } from "@/lib/transaction-status-labels";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const openStatuses = ["pending", "waiting_confirmation"];

const REVENUE = "#2a78d6";

const SIGNUPS = "#c96d8e";

const SUCCESS = "#2a78d6";

const FAILED = "#bf8a2f";

const revenueSeries: TrendSeries[] = [{ key: "revenue", label: "Pendapatan", color: REVENUE }];

const signupSeries: TrendSeries[] = [{ key: "signups", label: "Pengguna baru", color: SIGNUPS }];

const requestSeries: TrendSeries[] = [
  { key: "success", label: "Berhasil", color: SUCCESS },
  { key: "failed", label: "Gagal", color: FAILED },
];

const planLabels = new Map<string, string>([
  ["monthly", "Bulanan"],
  ["yearly", "Tahunan"],
]);

const cardClass = "border border-site-line bg-site-panel p-5 sm:p-6";

const numberFormat = new Intl.NumberFormat("id-ID");

const compactFormat = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });

const dayLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });

const formatDay = (date: Date | string | number) =>
  new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

const amountFormat = (amount: number, currency: string) => `${currency} ${amount.toLocaleString("en-US")}`;

const buttonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

const chipClass = (selected: boolean) =>
  `inline-flex min-h-9 items-center border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent ${
    selected
      ? "border-site-accent bg-site-accent-soft text-site-text"
      : "border-site-line text-site-text-muted hover:border-site-line-strong hover:text-site-text"
  }`;

function BarList({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <p className="text-sm text-site-text">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-site-text-faint">Belum ada data.</p>
      ) : (
        items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-site-text-2">{item.label}</span>
              <span className="tabular-nums text-site-text">{numberFormat.format(item.value)}</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-site-line-soft">
              <div className="h-full bg-site-accent-fill" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const range: AdminAnalyticsRange = ADMIN_ANALYTICS_RANGES.find((value) => String(value) === params.range) ?? 30;
  const { daily, statusCounts, planCounts, totals } = await getAdminAnalytics(range);
  const transactions = await transactionsRepository.getAll(100);
  const waiting = transactions.filter((t) => t.status === "waiting_confirmation").length;
  const open = transactions.filter((t) => openStatuses.includes(t.status)).length;

  const points = daily.map((point) => ({
    label: dayLabel.format(point.day),
    values: { revenue: point.revenue, signups: point.signups, success: point.success, failed: point.failed },
  }));

  return (
    <>
      <DashboardTitle meta="Analitik ringkas dan konfirmasi pembayaran transfer bank.">Admin</DashboardTitle>

      <nav aria-label="Rentang waktu" className="mb-8 flex flex-wrap gap-2">
        {ADMIN_ANALYTICS_RANGES.map((value) => (
          <Link
            key={value}
            href={`/dashboard/admin?range=${value}`}
            aria-current={value === range ? "true" : undefined}
            className={chipClass(value === range)}
          >
            {value} hari
          </Link>
        ))}
      </nav>

      <div className="mb-12 grid gap-6 sm:grid-cols-3">
        <div className={`${cardClass} grid gap-8`}>
          <Stat value={numberFormat.format(totals.totalUsers)} unit="pengguna terdaftar" />
          <Stat value={numberFormat.format(totals.newUsers)} unit="pengguna baru" />
        </div>
        <div className={`${cardClass} grid gap-8`}>
          <Stat value={`Rp ${compactFormat.format(totals.revenueRange)}`} unit="pendapatan terkonfirmasi" />
          <Stat value={totals.conversion === null ? "–" : `${totals.conversion}%`} unit="transaksi terkonfirmasi" />
        </div>
        <div className={`${cardClass} grid gap-8`}>
          <Stat value={numberFormat.format(totals.requests)} unit="permintaan MCP" />
          <Stat value={numberFormat.format(totals.activeUsers)} unit="pengguna aktif" />
        </div>
      </div>

      <section className="mb-12 grid gap-6 lg:grid-cols-2" aria-label="Grafik">
        <div className={`${cardClass} lg:col-span-2`}>
          <TrendChart title="Pendapatan per hari" series={revenueSeries} points={points} unit="idr" />
        </div>
        <div className={cardClass}>
          <TrendChart title="Pengguna baru per hari" series={signupSeries} points={points} unit="count" />
        </div>
        <div className={cardClass}>
          <TrendChart title="Permintaan MCP per hari" series={requestSeries} points={points} unit="count" />
        </div>
        <div className={cardClass}>
          <BarList
            title="Status transaksi"
            items={statusCounts.map((item) => ({ label: transactionStatusLabel(item.status), value: item.value }))}
          />
        </div>
        <div className={cardClass}>
          <BarList
            title="Paket terkonfirmasi"
            items={planCounts.map((item) => ({ label: planLabels.get(item.planType) ?? item.planType, value: item.value }))}
          />
        </div>
      </section>

      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className={cardClass}>
          <Stat value={String(waiting)} unit="menunggu konfirmasi" />
        </div>
        <div className={cardClass}>
          <Stat value={String(open)} unit="transaksi terbuka" />
        </div>
        <div className={cardClass}>
          <Stat value={String(transactions.length)} unit="transaksi terbaru" />
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-site-text-muted">Belum ada transaksi.</p>
      ) : (
        <div className="overflow-x-auto border border-site-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-site-header text-site-text-muted">
              <tr>
                <th className="px-4 py-2.5 font-normal">Pengguna</th>
                <th className="px-4 py-2.5 font-normal">Paket</th>
                <th className="px-4 py-2.5 font-normal">Jumlah</th>
                <th className="px-4 py-2.5 font-normal">Referensi</th>
                <th className="px-4 py-2.5 font-normal">Status</th>
                <th className="px-4 py-2.5 font-normal">Dibuat</th>
                <th className="px-4 py-2.5 font-normal">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isOpen = openStatuses.includes(transaction.status);

                return (
                  <tr key={transaction.id} className="border-t border-site-line">
                    <td className="whitespace-nowrap px-4 py-2.5 text-site-text">{transaction.user?.email ?? "–"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 capitalize text-site-text">{transaction.planType}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-site-text tabular-nums">
                      {amountFormat(transaction.amount, transaction.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-site-text-2">{transaction.transactionReference}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span
                        className={`border px-2 py-0.5 text-xs ${
                          isOpen ? "border-site-accent text-site-accent" : "border-site-line text-site-text-muted"
                        }`}
                      >
                        {transactionStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-site-text-muted tabular-nums">
                      {formatDay(transaction.createdAt ?? new Date(0))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {isOpen ? (
                        <div className="flex gap-2">
                          <ConfirmTransactionButton
                            transactionId={transaction.id}
                            reference={transaction.transactionReference}
                            amountLabel={amountFormat(transaction.amount, transaction.currency)}
                            email={transaction.user?.email ?? "–"}
                          />
                          <form action={cancelTransactionAction}>
                            <input type="hidden" name="id" value={transaction.id} />
                            <button
                              type="submit"
                              className={`${buttonClass} border border-site-line text-site-text-2 hover:border-site-line-strong`}
                            >
                              Batalkan
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-site-text-faint">–</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
