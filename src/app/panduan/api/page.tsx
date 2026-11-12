import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import type { Metadata } from "next";
import Link from "next/link";
import { Code, Section } from "@/components/site/docs-content";
import { DocsToc } from "@/components/site/docs-toc";
import {
  CodeBlock,
  SitePage,
  linkClass,
  mutedLinkClass,
} from "@/components/site/site-page";
import { SITE_URL } from "@/lib/geo/site";

export const metadata: Metadata = {
  title: "REST API Vidiopintar",
  description:
    "Referensi REST API Vidiopintar untuk mengambil transkrip YouTube bertimestamp dengan API key.",
  alternates: { canonical: `${SITE_URL}/panduan/api` },
};

const endpoint = `${SITE_URL}/api/v1/transcript`;

const sections = [
  { id: "autentikasi", title: "Autentikasi" },
  { id: "endpoint", title: "Endpoint" },
  { id: "parameter", title: "Parameter" },
  { id: "respons", title: "Respons" },
  { id: "halaman", title: "Halaman berikutnya" },
  { id: "error", title: "Error" },
  { id: "batas", title: "Batas penggunaan" },
];

const curlGet = `curl "${endpoint}?video=https://youtu.be/dQw4w9WgXcQ&language=id" \\
  -H "Authorization: Bearer <API_KEY>"`;

const curlPost = `curl ${endpoint} \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"video": "https://youtu.be/dQw4w9WgXcQ", "language": "id"}'`;

const response = `{
  "video_id": "dQw4w9WgXcQ",
  "language": "id",
  "title": "…",
  "metadata": {
    "author_name": "…",
    "author_url": "…",
    "thumbnail_url": "…"
  },
  "transcript": [
    { "text": "…", "start": 0, "duration": 4.2 },
    …
  ],
  "next_cursor": "…"
}`;

const paginate = `const headers = { Authorization: "Bearer <API_KEY>" };
const segments = [];
let cursor;

do {
  const url = new URL("${endpoint}");
  if (cursor) url.searchParams.set("cursor", cursor);
  else url.searchParams.set("video", "https://youtu.be/dQw4w9WgXcQ");

  const res = await fetch(url, { headers });
  const page = await res.json();
  if (!res.ok) throw new Error(\`\${page.error_code}: \${page.message}\`);

  segments.push(...page.transcript);
  cursor = page.next_cursor;
} while (cursor);`;

const errorBody = `{
  "error_code": "USAGE_LIMIT_EXCEEDED",
  "retryable": true,
  "retry_after_seconds": 60,
  "message": "Batas penggunaan sudah tercapai."
}`;

const params = [
  {
    name: "video",
    required: "ya*",
    desc: "URL atau ID video YouTube. Wajib, kecuali saat melanjutkan dengan cursor.",
  },
  {
    name: "language",
    required: "tidak",
    desc: "Kode bahasa pilihan, misalnya id atau en. Jika tidak tersedia, layanan memakai bahasa caption lain.",
  },
  {
    name: "cursor",
    required: "tidak",
    desc: "Nilai next_cursor dari respons sebelumnya untuk mengambil halaman berikutnya.",
  },
];

const fields = [
  ["video_id", "ID video YouTube 11 karakter."],
  ["language", "Bahasa caption yang benar-benar dipakai."],
  ["title", "Judul video, jika tersedia."],
  ["metadata", "author_name, author_url, dan thumbnail_url, jika tersedia."],
  [
    "transcript",
    "Daftar segmen dengan text, start (detik), dan duration (detik).",
  ],
  ["next_cursor", "Ada jika masih ada halaman berikutnya."],
];

const errors = [
  ["400", "INVALID_REQUEST", "Parameter tidak valid atau body bukan JSON."],
  ["400", "INVALID_VIDEO_REFERENCE", "URL atau ID video tidak valid."],
  ["400", "INVALID_CURSOR", "Cursor kedaluwarsa, rusak, atau milik key lain."],
  [
    "401",
    "INVALID_CREDENTIALS",
    "API key tidak ada, salah, atau sudah dicabut.",
  ],
  ["402", "PLAN_REQUIRED", "Paket berbayar pemilik key sudah berakhir."],
  [
    "404",
    "CAPTIONS_UNAVAILABLE",
    "Video tidak memiliki caption yang dapat diambil.",
  ],
  ["404", "VIDEO_UNAVAILABLE", "Video tidak tersedia di YouTube."],
  ["429", "USAGE_LIMIT_EXCEEDED", "Batas key atau kuota paket tercapai."],
  ["500", "SERVICE_MISCONFIGURED", "Gangguan di sisi layanan."],
  [
    "503",
    "TEMPORARY_PROVIDER_FAILURE",
    "YouTube sedang membatasi permintaan. Coba lagi.",
  ],
];

const limits = [
  ["Permintaan per menit", "30"],
  ["Permintaan per hari", "1.000"],
  ["Data transkrip per hari", "10 MB"],
];

function Table({ head, rows }: { head?: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto border border-site-line">
      <table className="w-full text-left text-sm sm:text-base">
        {head && (
          <thead className="bg-site-header text-site-text-muted">
            <tr>
              {head.map((cell) => (
                <th key={cell} className="px-4 py-3 font-normal">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.join("|")}
              className={
                head || index > 0
                  ? "border-t border-site-line align-top"
                  : "align-top"
              }
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cell}
                  className={
                    cellIndex === 0
                      ? "px-4 py-3 whitespace-nowrap text-site-text"
                      : "px-4 py-3 leading-7"
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RestApiPage() {
  return (
    <SitePage wide>
      <div className="mt-16 grid gap-12 sm:mt-24 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <DocsToc items={sections} />
        </aside>

        <article className="min-w-0 max-w-3xl space-y-12 text-base leading-8 text-site-text-2 sm:text-lg">
          <header>
            <p className="text-sm text-site-accent">Panduan REST API</p>
            <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1] tracking-tight text-site-text sm:text-6xl">
              Ambil transkrip YouTube lewat HTTP.
            </h1>
            <p className="mt-6 text-site-text-muted">
              REST API memberi hasil yang sama dengan alat MCP{" "}
              <Code>youtube_get_transcript</Code>, untuk aplikasi, skrip, atau
              backend Anda sendiri. Memakai AI Agent? Lihat{" "}
              <Link className={linkClass} href="/panduan">
                panduan MCP
              </Link>
              .
            </p>
          </header>

          <Section id="autentikasi" title="Autentikasi">
            <p>
              REST API memakai API key yang sama dengan MCP. Buat key di{" "}
              <Link className={linkClass} href="/dashboard/api-keys">
                dashboard
              </Link>
              , lalu kirim di header <Code>Authorization</Code>:
            </p>
            <CodeBlock label="header">
              {"Authorization: Bearer <API_KEY>"}
            </CodeBlock>
            <p>
              Panggil API dari server Anda. Jangan menaruh API key di kode
              browser atau aplikasi mobile.
            </p>
          </Section>

          <Section id="endpoint" title="Endpoint">
            <p>
              <Code>GET</Code> atau <Code>POST</Code> <Code>{endpoint}</Code>
            </p>
            <p>
              Dengan <Code>GET</Code>, kirim parameter sebagai query string.
              Dengan <Code>POST</Code>, kirim body JSON.
            </p>
            <CodeBlock label="GET">{curlGet}</CodeBlock>
            <CodeBlock label="POST">{curlPost}</CodeBlock>
          </Section>

          <Section id="parameter" title="Parameter">
            <Table
              head={["Parameter", "Wajib", "Keterangan"]}
              rows={params.map((param) => [
                param.name,
                param.required,
                param.desc,
              ])}
            />
            <p>
              URL yang didukung: <Code>youtube.com/watch?v=…</Code>,{" "}
              <Code>youtu.be/…</Code>, <Code>/shorts/…</Code>, dan{" "}
              <Code>/embed/…</Code>.
            </p>
          </Section>

          <Section id="respons" title="Respons">
            <p>
              Permintaan berhasil mengembalikan status <Code>200</Code> dengan
              body JSON berikut:
            </p>
            <CodeBlock label="200 OK">{response}</CodeBlock>
            <Table head={["Field", "Keterangan"]} rows={fields} />
            <div className="flex gap-4 border border-site-line border-l-2 border-l-site-accent bg-site-header p-5">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="mt-1.5 size-5 shrink-0 text-site-accent"
              />
              <p>
                Teks transkrip berasal dari video. Jika Anda meneruskannya ke
                model AI, perlakukan sebagai data, bukan instruksi.
              </p>
            </div>
          </Section>

          <Section id="halaman" title="Halaman berikutnya">
            <p>
              Setiap halaman memuat sampai sekitar 24 KB segmen. Jika respons
              berisi <Code>next_cursor</Code>, panggil lagi dengan{" "}
              <Code>cursor</Code> sampai <Code>next_cursor</Code> tidak ada.
              Cursor berlaku 15 menit dan hanya bisa dipakai dengan API key yang
              membuatnya.
            </p>
            <CodeBlock label="JavaScript">{paginate}</CodeBlock>
          </Section>

          <Section id="error" title="Error">
            <p>
              Error memakai status HTTP yang sesuai dan body JSON dengan{" "}
              <Code>error_code</Code>. Jika <Code>retryable</Code> bernilai{" "}
              <Code>true</Code>, coba lagi setelah{" "}
              <Code>retry_after_seconds</Code>. Nilai yang sama juga dikirim di
              header <Code>Retry-After</Code>.
            </p>
            <CodeBlock label="429 Too Many Requests">{errorBody}</CodeBlock>
            <Table head={["Status", "Kode", "Arti"]} rows={errors} />
          </Section>

          <Section id="batas" title="Batas penggunaan">
            <p>
              REST API dan MCP berbagi batas yang sama. Setiap API key memiliki
              batas berikut:
            </p>
            <Table rows={limits} />
            <p>
              Setiap panggilan, termasuk halaman lanjutan, juga dihitung dari
              kuota paket Anda. Kuota dibagi untuk semua key milik akun Anda.
              Panggilan yang gagal tidak dihitung dari kuota paket. Riwayat
              permintaan muncul di{" "}
              <Link className={linkClass} href="/dashboard/logs">
                log dashboard
              </Link>
              .
            </p>
          </Section>

          <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t border-site-line-soft pt-8 text-sm text-site-text-muted">
            <Link className={mutedLinkClass} href="/panduan">
              Panduan MCP
            </Link>
            <Link className={mutedLinkClass} href="/privacy">
              Privasi
            </Link>
            <Link className={mutedLinkClass} href="/terms">
              Ketentuan
            </Link>
            <a className={mutedLinkClass} href="mailto:support@vidiopintar.com">
              Dukungan
            </a>
          </footer>
        </article>
      </div>
    </SitePage>
  );
}
