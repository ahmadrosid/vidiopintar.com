import Link from "next/link";
import { CaretLeft, CaretRight, CheckCircle, WarningCircle } from "@phosphor-icons/react/ssr";
import { getCurrentUser } from "@/lib/auth";
import { getUserMcpLogs, LOG_PAGE_SIZE } from "@/lib/mcp/analytics";
import { outcomeLabels } from "@/lib/mcp/outcomes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardTitle } from "../dashboard-sidebar";

// Validated with the dataviz palette checker against the #131518 surface.
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

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e28fab]";
const filterItem = "cursor-pointer rounded-none text-[#c3c9d1] focus:bg-[#2d1f2a] focus:text-[#e8ebef]";

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
      <DashboardTitle meta="Setiap permintaan ke API MCP beserta hasil dan kode error-nya.">Log</DashboardTitle>

      <form action="/dashboard/logs" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="log-outcome" className="mb-2 block text-sm text-[#8c95a1]">Hasil</label>
          <Select name="outcome" defaultValue={outcome}>
            <SelectTrigger
              id="log-outcome"
              className={`min-h-12 w-full cursor-pointer rounded-none border-[#2a2d34] bg-[#0b0c0f] px-4 text-base text-[#e8ebef] ${focusRing}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none border-[#2a2d34] bg-[#16181c] text-[#e8ebef]">
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
          className={`inline-flex min-h-12 cursor-pointer items-center justify-center bg-[#e28fab] px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-[#f2b2c4] ${focusRing}`}
        >
          Terapkan
        </button>
      </form>

      <p className="mb-4 text-sm text-[#8c95a1] tabular-nums">
        {numberFormat.format(total)} permintaan · halaman {numberFormat.format(page + 1)} dari {numberFormat.format(totalPages)}
      </p>

      {rows.length === 0 ? (
        <p className="text-[#6f7782]">Belum ada log untuk filter ini.</p>
      ) : (
        <div className="overflow-x-auto border border-[#2a2d34]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#16181c] text-[#8c95a1]">
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
                const Icon = ok ? CheckCircle : WarningCircle;
                return (
                  <tr key={row.id} className="border-t border-[#2a2d34]">
                    <td className="whitespace-nowrap px-4 py-2.5 text-[#8c95a1] tabular-nums">{timeLabel.format(row.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="inline-flex items-center gap-2 text-[#e8ebef]">
                        <Icon weight="fill" className="size-4 shrink-0" style={{ color: ok ? SUCCESS : FAILED }} />
                        {outcomeLabels[row.outcome] ?? row.outcome}
                      </span>
                      {!ok && <span className="block text-xs text-[#6f7782]">{row.outcome}</span>}
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

      {totalPages > 1 && (
        <nav aria-label="Halaman log" className="mt-6 flex items-center justify-between gap-4 text-sm">
          {page > 0 ? (
            <Link
              href={pageHref(page - 1)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-[#8c95a1] hover:text-white ${focusRing}`}
            >
              <CaretLeft className="size-4" /> Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          {page + 1 < totalPages ? (
            <Link
              href={pageHref(page + 1)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 text-[#8c95a1] hover:text-white ${focusRing}`}
            >
              Berikutnya <CaretRight className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
