import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, CheckmarkCircle02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserMcpLogs, LOG_PAGE_SIZE } from "@/lib/mcp/analytics";
import { outcomeLabels } from "@/lib/mcp/outcomes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardTitle } from "../dashboard-sidebar";

const SUCCESS = "#c96d8e";
const FAILED = "#bf8a2f";

const errorCodes = Object.keys(outcomeLabels).filter((code) => code !== "success");

const numberFormat = new Intl.NumberFormat("id-ID");
const decimalFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const formatDuration = (ms: number) => (ms < 1000 ? `${ms} ms` : `${decimalFormat.format(ms / 1000)} dtk`);
const timeLabel = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Asia/Jakarta",
});

function isOutcomeFilter(value: string | undefined): value is string {
  return value === "all" || value === "failed" || (value !== undefined && Object.hasOwn(outcomeLabels, value));
}

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";
const filterItem = "cursor-pointer rounded-none text-site-text-2 focus:bg-site-accent-soft focus:text-site-text";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ outcome?: string; page?: string }>;
}) {
  const params = await searchParams;
  const outcome = isOutcomeFilter(params.outcome) ? params.outcome : "all";
  const requestedPage = Number(params.page);
  const page = Number.isInteger(requestedPage) && requestedPage >= 1 ? requestedPage - 1 : 0;

  const user = await getCurrentUser();
  const { rows, total } = await getUserMcpLogs(user.id, outcome, page);
  const totalPages = Math.max(1, Math.ceil(total / LOG_PAGE_SIZE));
  const pageHref = (target: number) => {
    const query = new URLSearchParams({ outcome, page: String(target + 1) });
    return `/dashboard/logs?${query}`;
  };

  return (
    <>
      <DashboardTitle meta="Setiap permintaan ke API MCP beserta hasil dan kode error-nya.">Riwayat</DashboardTitle>

      <form action="/dashboard/logs" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="log-outcome" className="mb-2 block text-sm text-site-text-muted">Hasil</label>
          <Select name="outcome" defaultValue={outcome}>
            <SelectTrigger
              id="log-outcome"
              className={`min-h-12 w-full cursor-pointer rounded-none border-site-line bg-site-panel px-4 text-base text-site-text ${focusRing}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-site-line bg-site-header text-site-text">
              <SelectItem value="all" className={filterItem}>Semua</SelectItem>
              <SelectItem value="success" className={filterItem}>Berhasil</SelectItem>
              <SelectItem value="failed" className={filterItem}>Semua error</SelectItem>
              {errorCodes.map((code) => (
                <SelectItem key={code} value={code} className={filterItem}>
                  {outcomeLabels[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <button
          type="submit"
          className={`inline-flex min-h-12 cursor-pointer items-center justify-center bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover ${focusRing}`}
        >
          Terapkan
        </button>
      </form>

      <p className="mb-4 text-sm text-site-text-muted tabular-nums">
        {numberFormat.format(total)} permintaan · halaman {numberFormat.format(page + 1)} dari {numberFormat.format(totalPages)}
      </p>

      {rows.length === 0 ? (
        <p className="text-site-text-faint">Belum ada log untuk filter ini.</p>
      ) : (
        <div className="overflow-x-auto border border-site-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-site-header text-site-text-muted">
              <tr>
                <th className="px-4 py-2.5 font-normal">Waktu</th>
                <th className="px-4 py-2.5 font-normal">Status</th>
                <th className="px-4 py-2.5 font-normal">Video</th>
                <th className="px-4 py-2.5 font-normal">Key</th>
                <th className="px-4 py-2.5 text-right font-normal">Durasi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const ok = row.outcome === "success";
                const Icon = ok ? CheckmarkCircle02Icon : AlertCircleIcon;
                return (
                  <tr key={row.id} className="border-t border-site-line">
                    <td className="whitespace-nowrap px-4 py-2.5 text-site-text-muted tabular-nums">{timeLabel.format(row.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="inline-flex items-center gap-2 text-site-text">
                        <HugeiconsIcon icon={Icon} className="size-4 shrink-0" style={{ color: ok ? SUCCESS : FAILED }} />
                        {outcomeLabels[row.outcome] ?? row.outcome}
                      </span>
                      {!ok && <span className="block text-xs text-site-text-faint">{row.outcome}</span>}
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

      {totalPages > 1 && (
        <nav aria-label="Halaman log" className="mt-6 flex items-center justify-between gap-4 text-sm">
          {page > 0 ? (
            <Link
              href={pageHref(page - 1)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-site-text-muted hover:text-site-text ${focusRing}`}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" /> Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          {page + 1 < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-site-text-muted hover:text-site-text ${focusRing}`}
            >
              Berikutnya <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
