import Link from "next/link";
import { CheckCircle, ClockCounterClockwise, Gauge, Key, UserCircle, WarningCircle } from "@phosphor-icons/react/ssr";
import { Row, Stat } from "@/components/site/site-page";
import { getCurrentUser } from "@/lib/auth";
import { ANALYTICS_RANGES, getUserMcpAnalytics, type AnalyticsRange, type HistoryStatus } from "@/lib/mcp/analytics";
import { listUserMcpKeys, MAX_ACTIVE_KEYS_PER_USER } from "@/lib/mcp/keys";
import { ApiKeysManager } from "./api-keys-manager";
import { ColumnChart, type ChartSeries } from "./column-chart";
import { DashboardTitle } from "./dashboard-sidebar";
import { DeleteAccount } from "./delete-account";

// Validated with the dataviz palette checker against the #131518 surface.
const SUCCESS = "#c96d8e";
const FAILED = "#bf8a2f";

const requestSeries: ChartSeries[] = [
  { key: "success", label: "Berhasil", color: SUCCESS },
  { key: "failed", label: "Gagal", color: FAILED },
];
const bytesSeries: ChartSeries[] = [{ key: "bytes", label: "Transkrip", color: SUCCESS }];

const outcomeLabels: Record<string, string> = {
  success: "Berhasil",
  INVALID_VIDEO_REFERENCE: "Video tidak valid",
  CAPTIONS_UNAVAILABLE: "Tanpa transkrip",
  VIDEO_UNAVAILABLE: "Video tidak tersedia",
  INVALID_CURSOR: "Cursor kedaluwarsa",
  INVALID_CREDENTIALS: "Key tidak valid",
  USAGE_LIMIT_EXCEEDED: "Batas tercapai",
  TEMPORARY_PROVIDER_FAILURE: "Gangguan YouTube",
  SERVICE_MISCONFIGURED: "Gangguan layanan",
};

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

const formatMegabytes = (bytes: number) => `${decimalFormat.format(bytes / 1_000_000)} MB`;
const formatDuration = (ms: number) => (ms < 1000 ? `${ms} ms` : `${decimalFormat.format(ms / 1000)} dtk`);

function chipClass(selected: boolean) {
  return `inline-flex min-h-9 items-center border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e28fab] ${
    selected ? "border-[#e28fab] bg-[#2d1f2a] text-[#e8ebef]" : "border-[#2a2d34] text-[#8c95a1] hover:border-[#484a52] hover:text-[#e8ebef]"
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
  const [keys, { totals, daily, history }] = await Promise.all([
    listUserMcpKeys(user.id),
    getUserMcpAnalytics(user.id, range, status),
  ]);
  const successRate = totals.requests ? Math.round((totals.success / totals.requests) * 100) : null;
  const points = daily.map((point) => ({
    label: dayLabel.format(point.day),
    values: { success: point.success, failed: point.failed, bytes: point.bytes },
  }));

  return (
    <>
      <DashboardTitle>Dashboard</DashboardTitle>

      <nav aria-label="Rentang waktu" className="mb-2 flex flex-wrap gap-2">
        {ANALYTICS_RANGES.map((value) => (
          <Link key={value} href={href({ range: value })} aria-current={value === range ? "true" : undefined} className={chipClass(value === range)}>
            {value} hari
          </Link>
        ))}
      </nav>

      <div className="[&>section:first-child]:border-t-0">
        <Row label="Pemakaian" icon={<Gauge weight="duotone" />} wide>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Stat value={numberFormat.format(totals.requests)} unit="permintaan" />
            <Stat value={successRate === null ? "–" : `${successRate}%`} unit="berhasil" />
            <Stat value={numberFormat.format(totals.failed)} unit="gagal" />
            <Stat value={totals.medianMs === null ? "–" : formatDuration(totals.medianMs)} unit="median durasi" />
          </div>
          <div className="grid gap-10 pt-6 lg:grid-cols-2">
            <ColumnChart title="Permintaan per hari" series={requestSeries} points={points} unit="count" />
            <ColumnChart title={`Data transkrip per hari · ${formatMegabytes(totals.bytes)}`} series={bytesSeries} points={points} unit="bytes" />
          </div>
        </Row>

        <Row label="Riwayat" icon={<ClockCounterClockwise weight="duotone" />} wide>
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
            <p className="text-[#6f7782]">Belum ada permintaan.</p>
          ) : (
            <div className="overflow-x-auto border border-[#2a2d34]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#16181c] text-[#8c95a1]">
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
                    const Icon = ok ? CheckCircle : WarningCircle;
                    return (
                      <tr key={row.id} className="border-t border-[#2a2d34]">
                        <td className="whitespace-nowrap px-4 py-2.5 text-[#8c95a1] tabular-nums">{timeLabel.format(row.createdAt)}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-[#e8ebef]">
                          <span className="inline-flex items-center gap-2">
                            <Icon weight="fill" className="size-4 shrink-0" style={{ color: ok ? SUCCESS : FAILED }} />
                            {outcomeLabels[row.outcome] ?? row.outcome}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          {row.videoId ? (
                            <a
                              href={`https://www.youtube.com/watch?v=${row.videoId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#c3c9d1] underline decoration-[#484a52] underline-offset-4 hover:text-white"
                            >
                              {row.videoId}
                            </a>
                          ) : (
                            <span className="text-[#6f7782]">–</span>
                          )}
                        </td>
                        <td className="max-w-40 truncate px-4 py-2.5 text-[#8c95a1]">{row.keyName}</td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-[#8c95a1] tabular-nums">{formatDuration(row.durationMs)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {history.length === 50 && <p className="text-sm text-[#6f7782]">50 permintaan terbaru</p>}
        </Row>

        <Row label="API key" icon={<Key weight="duotone" />}>
          <p className="text-sm text-[#6f7782]">
            {keys.length}/{MAX_ACTIVE_KEYS_PER_USER} aktif
          </p>
          <ApiKeysManager keys={keys} />
        </Row>

        <Row label="Akun" icon={<UserCircle weight="duotone" />}>
          <DeleteAccount />
        </Row>
      </div>
    </>
  );
}
