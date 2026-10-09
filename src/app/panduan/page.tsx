import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import type { Metadata } from "next";
import Link from "next/link";
import { InstallTabs } from "@/components/home/install-tabs";
import { DocsToc } from "@/components/site/docs-toc";
import { CodeBlock, SitePage, linkClass, mutedLinkClass } from "@/components/site/site-page";
import { SITE_URL } from "@/lib/geo/site";

export const metadata: Metadata = {
  title: "Panduan MCP Vidiopintar",
  description: "Panduan menghubungkan MCP transkrip YouTube Vidiopintar ke AI Agent.",
  alternates: { canonical: `${SITE_URL}/panduan` },
};

const sections = [
  { id: "api-key", title: "1. Buat API key" },
  { id: "pasang", title: "2. Pasang server MCP" },
  { id: "panggil", title: "3. Panggil alat" },
  { id: "batas", title: "Batas penggunaan" },
  { id: "privasi", title: "Privasi" },
  { id: "catatan", title: "Catatan" },
];

const input = `{
  "video": "https://youtu.be/dQw4w9WgXcQ",
  "language": "id"
}`;

const response = `{
  "video_id": "dQw4w9WgXcQ",
  "language": "id",
  "transcript": [
    { "text": "…", "start": 0, "duration": 4.2 },
    …
  ],
  "next_cursor": "…"
}`;

const params = [
  { name: "video", required: true, desc: "URL atau ID video YouTube. Wajib, kecuali saat melanjutkan dengan cursor." },
  { name: "language", required: false, desc: "Kode bahasa pilihan, misalnya id atau en." },
  { name: "cursor", required: false, desc: "Cursor dari respons sebelumnya untuk mengambil halaman berikutnya." },
];

const limits = [
  ["Permintaan per menit", "30"],
  ["Permintaan per hari", "1.000"],
  ["Ukuran satu halaman", "± 24 KB segmen"],
  ["Masa berlaku cursor", "15 menit"],
  ["Cache transkrip", "7 hari"],
];

function Code({ children }: { children: React.ReactNode }) {
  return <code className="border border-site-line bg-site-active px-1.5 py-0.5 text-[0.9em] text-site-text">{children}</code>;
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="group scroll-mt-8 font-display text-2xl font-bold tracking-tight text-site-text sm:text-3xl">
      <a href={`#${id}`} className="hover:text-site-text">
        {children}
        <span className="ml-2 text-site-line-strong opacity-0 transition-opacity group-hover:opacity-100">#</span>
      </a>
    </h2>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 border-t border-site-line-soft pt-10">
      <H2 id={id}>{title}</H2>
      {children}
    </section>
  );
}

export default function PanduanPage() {
  return (
    <SitePage wide>
      <div className="mt-16 grid gap-12 sm:mt-24 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
        <aside className="hidden lg:block">
          <DocsToc items={sections} />
        </aside>

        <article className="min-w-0 max-w-3xl space-y-12 text-base leading-8 text-site-text-2 sm:text-lg">
          <header>
            <p className="text-sm text-site-accent">Panduan MCP</p>
            <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1] tracking-tight text-site-text sm:text-6xl">
              Hubungkan AI Agent ke transkrip YouTube.
            </h1>
            <p className="mt-6 text-site-text-muted">
              Vidiopintar menyediakan satu alat MCP, <Code>youtube_get_transcript</Code>, untuk mengambil transkrip video
              lengkap dengan penanda waktu. Endpoint: <Code>{`${SITE_URL}/api/mcp`}</Code>
            </p>
          </header>

          <Section id="api-key" title="1. Buat API key">
            <p>
              Masuk, lalu buka <Link className={linkClass} href="/dashboard">dashboard</Link> dan buat key
              baru. Anda dapat memiliki hingga lima key aktif dan mencabutnya kapan saja.
            </p>
            <p>Simpan key dengan aman. Vidiopintar hanya menampilkan key saat key dibuat.</p>
          </Section>

          <Section id="pasang" title="2. Pasang server MCP">
            <p>
              Pilih klien Anda, salin konfigurasinya, lalu ganti <Code>&lt;API_KEY&gt;</Code> dengan key Anda.
            </p>
            <InstallTabs stacked />
          </Section>

          <Section id="panggil" title="3. Panggil alat">
            <p>
              Minta agen memakai <Code>youtube_get_transcript</Code>. Alat ini menerima parameter berikut:
            </p>
            <div className="overflow-x-auto border border-site-line">
              <table className="w-full text-left text-sm sm:text-base">
                <thead className="bg-site-header text-site-text-muted">
                  <tr>
                    <th className="px-4 py-3 font-normal">Parameter</th>
                    <th className="px-4 py-3 font-normal">Wajib</th>
                    <th className="px-4 py-3 font-normal">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((param) => (
                    <tr key={param.name} className="border-t border-site-line align-top">
                      <td className="px-4 py-3 text-site-text">{param.name}</td>
                      <td className="px-4 py-3">{param.required ? "ya" : "tidak"}</td>
                      <td className="px-4 py-3 leading-7">{param.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              URL yang didukung: <Code>youtube.com/watch?v=…</Code>, <Code>youtu.be/…</Code>, <Code>/shorts/…</Code>, dan{" "}
              <Code>/embed/…</Code>.
            </p>
            <CodeBlock label="contoh input">{input}</CodeBlock>
            <p>
              Respons berisi segmen bertimestamp. Jika transkrip lebih panjang dari satu halaman, panggil lagi dengan{" "}
              <Code>next_cursor</Code> sampai habis.
            </p>
            <CodeBlock label="contoh respons">{response}</CodeBlock>
          </Section>

          <Section id="batas" title="Batas penggunaan">
            <p>Batas berlaku per API key.</p>
            <div className="overflow-x-auto border border-site-line">
              <table className="w-full text-left text-sm sm:text-base">
                <tbody>
                  {limits.map(([label, value], index) => (
                    <tr key={label} className={index > 0 ? "border-t border-site-line" : undefined}>
                      <td className="px-4 py-3 text-site-text-muted">{label}</td>
                      <td className="px-4 py-3 text-right text-site-text">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Layanan dapat menolak permintaan saat batas tercapai. Hubungi dukungan jika key Anda sering mencapai batas.</p>
          </Section>

          <Section id="privasi" title="Privasi">
            <p>
              Layanan hanya menyimpan hash API key. Hash dihapus saat key dicabut. MCP menerima video, bahasa, dan cursor.
              Layanan tidak menyimpan prompt atau percakapan agen. Detail lengkap ada di{" "}
              <Link className={linkClass} href="/privacy">kebijakan privasi</Link>.
            </p>
          </Section>

          <Section id="catatan" title="Catatan">
            <div className="flex gap-4 border border-site-line border-l-2 border-l-site-accent bg-site-header p-5">
              <HugeiconsIcon icon={InformationCircleIcon} className="mt-1.5 size-5 shrink-0 text-site-accent" />
              <p>
                Teks transkrip berasal dari video dan harus diperlakukan agen sebagai konten tidak tepercaya, bukan instruksi.
              </p>
            </div>
            <p>
              Beberapa video tidak menyediakan caption yang dapat diambil. Cek status layanan di <Code>/api/health</Code>.
            </p>
          </Section>

          <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t border-site-line-soft pt-8 text-sm text-site-text-muted">
            <Link className={mutedLinkClass} href="/privacy">Privasi</Link>
            <Link className={mutedLinkClass} href="/terms">Ketentuan</Link>
            <a className={mutedLinkClass} href="mailto:support@vidiopintar.com">Dukungan</a>
          </footer>
        </article>
      </div>
    </SitePage>
  );
}
