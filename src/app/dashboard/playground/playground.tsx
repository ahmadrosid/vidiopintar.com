"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Play } from "@phosphor-icons/react";
import { fetchTranscriptAction, type PlaygroundResult } from "./actions";

type Segment = { text: string; start: number; duration: number };
type TranscriptPage = Extract<PlaygroundResult, { ok: true }>["page"];

type RunState =
  | { status: "idle" }
  | { status: "error"; message: string; code: string; ms: number }
  | { status: "success"; page: TranscriptPage; segments: Segment[]; ms: number };

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e28fab]";
const inputClass = `min-h-12 w-full min-w-0 border border-[#2a2d34] bg-[#0b0c0f] px-4 text-base text-[#e8ebef] placeholder:text-[#6f7782] ${focusRing}`;
const labelClass = "mb-2 block text-sm text-[#8c95a1]";

const decimalFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const formatDuration = (ms: number) => (ms < 1000 ? `${ms} ms` : `${decimalFormat.format(ms / 1000)} dtk`);

function formatTimestamp(seconds: number) {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export function Playground() {
  const [video, setVideo] = useState("");
  const [language, setLanguage] = useState("");
  const [state, setState] = useState<RunState>({ status: "idle" });
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (cursor?: string) => {
    const previous = state.status === "success" && cursor ? state.segments : [];
    setCopied(false);
    startTransition(async () => {
      const startedAt = performance.now();
      const input = cursor
        ? { cursor }
        : { video: video.trim(), ...(language.trim() ? { language: language.trim() } : {}) };
      try {
        const result = await fetchTranscriptAction(input);
        const ms = Math.round(performance.now() - startedAt);
        if (!result.ok) {
          setState({ status: "error", message: result.message, code: result.code, ms });
          return;
        }
        setState({ status: "success", page: result.page, segments: [...previous, ...result.page.transcript], ms });
      } catch {
        setState({
          status: "error",
          message: "Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.",
          code: "NETWORK",
          ms: Math.round(performance.now() - startedAt),
        });
      }
    });
  };

  const copyTranscript = async () => {
    if (state.status !== "success") return;
    try {
      await navigator.clipboard.writeText(state.segments.map((s) => `[${formatTimestamp(s.start)}] ${s.text}`).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
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
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <div>
            <label htmlFor="pg-video" className={labelClass}>URL atau ID video</label>
            <input
              id="pg-video"
              value={video}
              onChange={(event) => setVideo(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pg-lang" className={labelClass}>Bahasa (opsional)</label>
            <input
              id="pg-lang"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              placeholder="id, en"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!canRun}
          className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 bg-[#e28fab] px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-[#f2b2c4] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
        >
          <Play weight="fill" className="size-4" />
          {pending ? "Mengambil…" : "Jalankan"}
        </button>
      </form>

      {state.status === "error" && (
        <div className="border border-[#2a2d34] border-l-2 border-l-[#bf8a2f] bg-[#0b0c0f] p-5">
          <p className="text-sm text-[#8c95a1]">
            {state.code} · {formatDuration(state.ms)}
          </p>
          <p className="mt-2 text-[#e8ebef]">{state.message}</p>
        </div>
      )}

      {state.status === "success" && (
        <div className="border border-[#2a2d34] bg-[#0b0c0f]">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[#2a2d34] bg-[#16181c] px-4 py-2 text-xs text-[#8c95a1] sm:text-sm">
            <span className="min-w-0 truncate">
              {state.page.title ? `${state.page.title} · ` : ""}
              {state.page.video_id} · {state.page.language} · {state.segments.length} segmen · {formatDuration(state.ms)}
            </span>
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setShowRaw((value) => !value)}
                className={`cursor-pointer hover:text-white ${focusRing}`}
              >
                {showRaw ? "Transkrip" : "JSON"}
              </button>
              <button
                type="button"
                onClick={copyTranscript}
                className={`inline-flex cursor-pointer items-center gap-1.5 hover:text-white ${focusRing}`}
              >
                {copied ? <Check className="size-4 text-[#e28fab]" /> : <Copy className="size-4" />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
          </div>

          {showRaw ? (
            <pre className="max-h-[32rem] overflow-auto p-5 text-sm leading-7 text-[#e8ebef]">
              {JSON.stringify(state.page, null, 2)}
            </pre>
          ) : (
            <ol className="max-h-[32rem] overflow-y-auto p-2">
              {state.segments.map((segment, index) => (
                <li key={`${segment.start}-${index}`} className="flex gap-4 px-3 py-1.5 text-sm leading-6 sm:text-base">
                  <span className="w-14 shrink-0 tabular-nums text-[#e28fab]">{formatTimestamp(segment.start)}</span>
                  <span className="min-w-0 text-[#c3c9d1]">{segment.text}</span>
                </li>
              ))}
            </ol>
          )}

          {state.page.next_cursor && (
            <div className="border-t border-[#2a2d34] px-4 py-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(state.page.next_cursor)}
                className={`cursor-pointer text-sm text-[#8c95a1] underline decoration-[#484a52] underline-offset-4 hover:text-white disabled:opacity-50 ${focusRing}`}
              >
                Ambil halaman berikutnya
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
