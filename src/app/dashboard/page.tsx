import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, CheckmarkCircle02Icon, HistoryIcon, GaugeIcon, UserCircleIcon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Row, Stat } from "@/components/site/site-page";
import { getCurrentUser } from "@/lib/auth";
import { ANALYTICS_RANGES, getUserMcpAnalytics, type AnalyticsRange, type HistoryStatus } from "@/lib/mcp/analytics";
import { outcomeLabels } from "@/lib/mcp/outcomes";
import { ColumnChart, type ChartSeries } from "./column-chart";
import { DashboardTitle } from "./dashboard-sidebar";
import { DeleteAccount } from "./delete-account";

const SUCCESS = "#c96d8e";
const FAILED = "#bf8a2f";

const requestSeries: ChartSeries[] = [
  { key: "success", label: "Berhasil", color: SUCCESS },
  { key: "failed", label: "Gagal", color: FAILED },
];

const statusFilters: { value: HistoryStatus; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "success", label: "Berhasil" },
  { value: "failed", label: "Gagal" },
];

const numberFormat = new Intl.NumberFormat("id-ID");
const decimalFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const dayLabel = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" });
const timeLabel = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

const formatDuration = (ms: number) => (ms < 1000 ? `${ms} ms` : `${decimalFormat.format(ms / 1000)} dtk`);

function chipClass(selected: boolean) {
  return `inline-flex min-h-9 items-center border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent ${
    selected ? "border-site-accent bg-site-accent-soft text-site-text" : "border-site-line text-site-text-muted hover:border-site-line-strong hover:text-site-text"
  }`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; status?: string }>;
}) {
  const params = await searchParams;
  const range: AnalyticsRange = ANALYTICS_RANGES.find((value) => String(value) === params.range) ?? 30;
  const status: HistoryStatus = statusFilters.find((item) => item.value === params.status)?.value ?? "all";
  const href = (next: { range?: AnalyticsRange; status?: HistoryStatus }) =>
    `/dashboard?${new URLSearchParams({ range: String(next.range ?? range), status: next.status ?? status })}`;

  const user = await getCurrentUser();
  const { totals, daily, history } = await getUserMcpAnalytics(user.id, range, status);
  const successRate = totals.requests ? Math.round((totals.success / totals.requests) * 100) : null;
  const points = daily.map((point) => ({
    label: dayLabel.format(point.day),
    values: { success: point.success, failed: point.failed, bytes: point.bytes },
  }));

  return (
    <>
      <DashboardTitle>Dashboard</DashboardTitle>

      <div className="mb-2 flex flex-wrap items-center gap-4">
        <Link
          href="/dashboard/api-keys"
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 bg-site-accent-fill px-5 font-display text-base font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
        >
          Buat API key
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
        </Link>
        <nav aria-label="Rentang waktu" className="mb-2 flex flex-wrap gap-2">
          {ANALYTICS_RANGES.map((value) => (
            <Link key={value} href={href({ range: value })} aria-current={value === range ? "true" : undefined} className={chipClass(value === range)}>
              {value} hari
            </Link>
          ))}
        </nav>
      </div>

      <div className="[&>section:first-child]:border-t-0">
        <Row label="Pemakaian" icon={<HugeiconsIcon icon={GaugeIcon} />} wide>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat value={numberFormat.format(totals.requests)} unit="permintaan" />
            <Stat value={successRate === null ? "–" : `${successRate}%`} unit="berhasil" />
            <Stat value={numberFormat.format(totals.failed)} unit="gagal" />
            <Stat value={totals.medianMs === null ? "–" : formatDuration(totals.medianMs)} unit="median durasi" />
          </div>
          <div className="pt-6">
            <ColumnChart title="Permintaan per hari" series={requestSeries} points={points} unit="count" />
          </div>
        </Row>

        <Row label="Riwayat" icon={<HugeiconsIcon icon={HistoryIcon} />} wide>
          <nav aria-label="Filter hasil" className="flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <Link
                key={item.value}
                href={href({ status: item.value })}
                aria-current={item.value === status ? "true" : undefined}
                className={chipClass(item.value === status)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {history.length === 0 ? (
            <p className="text-site-text-faint">Belum ada permintaan.</p>
          ) : (
            <div className="overflow-x-auto border border-site-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-site-header text-site-text-muted">
                  <tr>
                    <th className="px-4 py-2.5 font-normal">Waktu</th>
                    <th className="px-4 py-2.5 font-normal">Hasil</th>
                    <th className="px-4 py-2.5 font-normal">Video</th>
                    <th className="px-4 py-2.5 font-normal">Key</th>
                    <th className="px-4 py-2.5 text-right font-normal">Durasi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => {
                    const ok = row.outcome === "success";
                    const Icon = ok ? CheckmarkCircle02Icon : AlertCircleIcon;
                    return (
                      <tr key={row.id} className="border-t border-site-line">
                        <td className="whitespace-nowrap px-4 py-2.5 text-site-text-muted tabular-nums">{timeLabel.format(row.createdAt)}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-site-text">
                          <span className="inline-flex items-center gap-2">
                            <HugeiconsIcon icon={Icon} className="size-4 shrink-0" style={{ color: ok ? SUCCESS : FAILED }} />
                            {outcomeLabels[row.outcome] ?? row.outcome}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          {row.videoId ? (
                            <a
                              href={`https://www.youtube.com/watch?v=${row.videoId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-site-text-2 underline decoration-site-line-strong underline-offset-4 hover:text-site-text"
                            >
                              {row.videoId}
                            </a>
                          ) : (
                            <span className="text-site-text-faint">–</span>
                          )}
                        </td>
                        <td className="max-w-40 truncate px-4 py-2.5 text-site-text-muted">{row.keyName}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-site-text-muted tabular-nums">{formatDuration(row.durationMs)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {history.length === 50 && <p className="text-sm text-site-text-faint">50 permintaan terbaru</p>}
        </Row>

        <Row label="Akun" icon={<HugeiconsIcon icon={UserCircleIcon} />}>
          <DeleteAccount />
        </Row>
      </div>
    </>
  );
}
