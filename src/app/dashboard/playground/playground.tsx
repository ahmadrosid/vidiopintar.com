"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckIcon,
  Copy01Icon,
  PlayIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { useMemo, useState, useTransition } from "react";
import { fetchTranscriptAction, type PlaygroundResult } from "./actions";

type Segment = { text: string; start: number; duration: number };

type TranscriptPage = Extract<PlaygroundResult, { ok: true }>["page"];

type RunState =
  | { status: "idle" }
  | { status: "error"; message: string; code: string; ms: number }
  | {
      status: "success";
      page: TranscriptPage;
      segments: Segment[];
      ms: number;
    };

type CopyMode = "timestamps" | "text";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

const inputClass = `min-h-12 w-full min-w-0 border border-site-line bg-site-panel px-4 text-base text-site-text placeholder:text-site-text-faint ${focusRing}`;

const labelClass = "mb-2 block text-sm text-site-text-muted";

const numberFormat = new Intl.NumberFormat("id-ID");

const decimalFormat = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 1,
});

const formatDuration = (ms: number) =>
  ms < 1000 ? `${ms} ms` : `${decimalFormat.format(ms / 1000)} dtk`;

function formatTimestamp(seconds: number) {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");

  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text: string, query: string) {
  if (!query) return text;

  return text
    .split(new RegExp(`(${escapeRegExp(query)})`, "gi"))
    .map((part, index) =>
      index % 2 === 1 ? (
        <mark key={index} className="bg-site-accent-soft text-site-text">
          {part}
        </mark>
      ) : (
        part
      ),
    );
}

const jsonToken =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

const jsonTokenClass = {
  key: "text-[#8a3b5c]",
  string: "text-[#2f6b4f]",
  number: "text-[#9a6a1f]",
  keyword: "text-[#3b5b9a]",
} as const;

function JsonView({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2);
  const nodes: React.ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(jsonToken)) {
    const index = match.index ?? 0;

    if (index > last) nodes.push(text.slice(last, index));

    const [token, string, colon, keyword] = match;
    const className = string
      ? colon
        ? jsonTokenClass.key
        : jsonTokenClass.string
      : keyword
        ? jsonTokenClass.keyword
        : jsonTokenClass.number;

    nodes.push(
      <span key={index} className={className}>
        {string ?? token}
      </span>,
    );

    if (colon) nodes.push(colon);
    last = index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));

  return <>{nodes}</>;
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-site-line bg-white p-4">
      <p className="font-display text-2xl font-extrabold leading-none tracking-tight text-site-text">
        {value}
      </p>
      <p className="mt-2 text-sm text-site-text-muted">{label}</p>
    </div>
  );
}

export function Playground() {
  const [video, setVideo] = useState("");
  const [language, setLanguage] = useState("");
  const [state, setState] = useState<RunState>({ status: "idle" });
  const [showRaw, setShowRaw] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<CopyMode | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (cursor?: string) => {
    const previous = state.status === "success" && cursor ? state.segments : [];
    setCopied(null);
    startTransition(async () => {
      const startedAt = performance.now();

      const trimmedLanguage = language.trim();

      const input = cursor
        ? { cursor }
        : { video: video.trim(), language: trimmedLanguage || undefined };

      try {
        const result = await fetchTranscriptAction(input);
        const ms = Math.round(performance.now() - startedAt);

        if (!result.ok) {
          setState({
            status: "error",
            message: result.message,
            code: result.code,
            ms,
          });

          return;
        }

        setState({
          status: "success",
          page: result.page,
          segments: [...previous, ...result.page.transcript],
          ms,
        });
      } catch {
        setState({
          status: "error",
          message:
            "Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.",
          code: "NETWORK",
          ms: Math.round(performance.now() - startedAt),
        });
      }
    });
  };

  const stats = useMemo(() => {
    if (state.status !== "success") return null;

    const { segments } = state;
    const words = segments.reduce(
      (total, segment) =>
        total + segment.text.split(/\s+/).filter(Boolean).length,
      0,
    );
    const duration = segments.reduce(
      (max, segment) => Math.max(max, segment.start + segment.duration),
      0,
    );

    return { words, duration };
  }, [state]);

  const visibleSegments = useMemo(() => {
    if (state.status !== "success") return [];

    const needle = query.trim().toLowerCase();

    return needle
      ? state.segments.filter((segment) =>
          segment.text.toLowerCase().includes(needle),
        )
      : state.segments;
  }, [state, query]);

  const copyTranscript = async (mode: CopyMode) => {
    if (state.status !== "success") return;

    const text = state.segments
      .map((segment) =>
        mode === "timestamps"
          ? `[${formatTimestamp(segment.start)}] ${segment.text}`
          : segment.text,
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(mode);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  const canRun = video.trim().length > 0 && !pending;

  return (
    <div className="space-y-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (canRun) run();
        }}
        className="flex flex-wrap items-end gap-4"
      >
        <div className="min-w-64 flex-1">
          <label htmlFor="pg-video" className={labelClass}>
            URL atau ID video
          </label>
          <input
            id="pg-video"
            value={video}
            onChange={(event) => setVideo(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputClass}
          />
        </div>
        <div className="w-full sm:w-40">
          <label htmlFor="pg-lang" className={labelClass}>
            Bahasa (opsional)
          </label>
          <input
            id="pg-lang"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="id, en"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={!canRun}
          className={`inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center gap-2 bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
        >
          <HugeiconsIcon icon={PlayIcon} className="size-4" />
          {pending ? "Mengambil…" : "Jalankan"}
        </button>
      </form>

      {state.status === "error" && (
        <div className="border border-site-line border-l-2 border-l-[#bf8a2f] bg-site-panel p-5">
          <p className="text-sm text-site-text-muted">
            {state.code} · {formatDuration(state.ms)}
          </p>
          <p className="mt-2 text-site-text">{state.message}</p>
        </div>
      )}

      {state.status === "success" && stats && (
        <>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 flex-col gap-5 border border-site-line bg-white p-5 sm:flex-row">
              {state.page.metadata?.thumbnail_url && (
                <Image
                  src={state.page.metadata.thumbnail_url}
                  alt=""
                  width={320}
                  height={180}
                  className="h-auto w-full shrink-0 border border-site-line sm:w-56"
                />
              )}
              <div className="min-w-0 space-y-2">
                <a
                  href={`https://www.youtube.com/watch?v=${state.page.video_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`block font-display text-xl font-bold leading-tight tracking-tight text-site-text hover:text-site-accent ${focusRing}`}
                >
                  {state.page.title ?? state.page.video_id}
                </a>
                {state.page.metadata?.author_name && (
                  <p className="text-sm text-site-text-muted">
                    {state.page.metadata.author_name}
                  </p>
                )}
                <p className="text-sm text-site-text-faint">
                  ID {state.page.video_id} · Bahasa {state.page.language}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:w-96 lg:shrink-0">
              <StatBox
                value={numberFormat.format(state.segments.length)}
                label="segmen dimuat"
              />
              <StatBox
                value={formatTimestamp(stats.duration)}
                label="durasi video"
              />
              <StatBox value={numberFormat.format(stats.words)} label="kata" />
              <StatBox value={formatDuration(state.ms)} label="waktu ambil" />
            </div>
          </div>

          <div className="border border-site-line bg-site-panel">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-site-line bg-site-header px-4 py-2 text-xs text-site-text-muted sm:text-sm">
              <label className="relative flex min-w-48 flex-1 items-center">
                <span className="sr-only">Cari di transkrip</span>
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="pointer-events-none absolute left-2 size-4"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari di transkrip…"
                  className={`h-9 w-full min-w-0 border border-site-line bg-site-panel pr-3 pl-8 text-sm text-site-text placeholder:text-site-text-faint ${focusRing}`}
                />
              </label>
              <div className="flex shrink-0 flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowRaw((value) => !value)}
                  className={`cursor-pointer hover:text-site-text ${focusRing}`}
                >
                  {showRaw ? "Transkrip" : "JSON"}
                </button>
                <button
                  type="button"
                  onClick={() => copyTranscript("text")}
                  className={`inline-flex cursor-pointer items-center gap-1.5 hover:text-site-text ${focusRing}`}
                >
                  {copied === "text" ? (
                    <HugeiconsIcon
                      icon={CheckIcon}
                      className="size-4 text-site-accent"
                    />
                  ) : (
                    <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                  )}
                  {copied === "text" ? "Tersalin" : "Salin teks"}
                </button>
                <button
                  type="button"
                  onClick={() => copyTranscript("timestamps")}
                  className={`inline-flex cursor-pointer items-center gap-1.5 hover:text-site-text ${focusRing}`}
                >
                  {copied === "timestamps" ? (
                    <HugeiconsIcon
                      icon={CheckIcon}
                      className="size-4 text-site-accent"
                    />
                  ) : (
                    <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                  )}
                  {copied === "timestamps" ? "Tersalin" : "Salin + waktu"}
                </button>
              </div>
            </div>

            {showRaw ? (
              <pre className="max-h-[32rem] overflow-auto bg-white p-5 text-sm leading-7 text-site-text-2">
                <JsonView value={state.page} />
              </pre>
            ) : visibleSegments.length === 0 ? (
              <p className="p-5 text-sm text-site-text-faint">
                Tidak ada segmen yang cocok dengan “{query}”.
              </p>
            ) : (
              <ol className="max-h-[32rem] overflow-y-auto p-2">
                {visibleSegments.map((segment) => (
                  <li
                    key={`${segment.start}-${segment.text}`}
                    className="flex gap-4 px-3 py-1.5 text-sm leading-6 sm:text-base"
                  >
                    <a
                      href={`https://www.youtube.com/watch?v=${state.page.video_id}&t=${Math.floor(segment.start)}s`}
                      target="_blank"
                      rel="noreferrer"
                      className={`w-14 shrink-0 tabular-nums text-site-accent underline decoration-transparent underline-offset-4 hover:decoration-site-accent ${focusRing}`}
                    >
                      {formatTimestamp(segment.start)}
                    </a>
                    <span className="min-w-0 text-site-text-2">
                      {highlight(segment.text, query.trim())}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-site-line px-4 py-3 text-sm text-site-text-muted">
              <span>
                {query.trim()
                  ? `${numberFormat.format(visibleSegments.length)} dari ${numberFormat.format(state.segments.length)} segmen cocok`
                  : `Menampilkan ${numberFormat.format(state.segments.length)} segmen`}
              </span>
              {state.page.next_cursor && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(state.page.next_cursor)}
                  className={`cursor-pointer underline decoration-site-line-strong underline-offset-4 hover:text-site-text disabled:opacity-50 ${focusRing}`}
                >
                  Ambil halaman berikutnya
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
