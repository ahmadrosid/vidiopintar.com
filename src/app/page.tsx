import type { Metadata } from "next";
import { InstallTabs } from "@/components/home/install-tabs";
import { KyotoDusk } from "@/components/home/kyoto-dusk";
import Link from "next/link";
import { ArrowUpRight, Check, Function as FunctionIcon, Gauge, ShieldCheck, TerminalWindow } from "@phosphor-icons/react/ssr";
import { PageTitle, Row, SeeAlso, SitePage, Stat } from "@/components/site/site-page";
import { SITE_URL } from "@/lib/geo/site";

const requestAccessHref = `mailto:support@vidiopintar.com?subject=${encodeURIComponent("Minta API key MCP Vidiopintar")}&body=${encodeURIComponent("Nama agen/aplikasi:\nKontak:\nKegunaan:\n")}`;

export const metadata: Metadata = {
  title: "Transkrip YouTube untuk Agen AI",
  description: "MCP untuk mengambil transkrip YouTube dengan penanda waktu.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Transkrip YouTube untuk Agen AI | Vidiopintar",
    description: "MCP untuk mengambil transkrip YouTube dengan penanda waktu.",
    url: SITE_URL,
    siteName: "Vidiopintar",
    locale: "id_ID",
    type: "website",
  },
};

const response = `{
  "video_id": "…",
  "language": "id",
  "transcript": [
    { "text": "…", "start": 0, "duration": 4.2 },
    …
  ],
  "next_cursor": "…"
}`;

export default function Page() {
  return (
    <SitePage backdrop={<KyotoDusk />}>
      <PageTitle>
        <span className="text-[#e28fab]">vidiopintar</span> — transkrip YouTube untuk agen AI.
      </PageTitle>

      <div className="-mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        <a
          href={requestAccessHref}
          className="inline-flex min-h-12 items-center gap-2 bg-[#e28fab] px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-[#f2b2c4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e28fab]"
        >
          Minta API key <ArrowUpRight weight="bold" className="size-5" />
        </a>
        <Link href="/panduan" className="text-base text-[#c3c9d1] underline decoration-[#484a52] underline-offset-4 hover:text-white">
          Panduan
        </Link>
      </div>

      <div className="mt-16 sm:mt-20 lg:mt-24 [&>section:first-child]:border-t-0">
        <Row label="Pasang" icon={<TerminalWindow weight="duotone" />} wide>
          <InstallTabs />
        </Row>

        <Row label="Alat" icon={<FunctionIcon weight="duotone" />}>
          <p>
            <span className="text-[#e8ebef]">youtube_get_transcript</span>
            <span className="text-[#6f7782]">(video, language?, cursor?)</span>
          </p>
          <p className="text-[#8c95a1]">URL atau ID video. Mendukung watch, youtu.be, shorts, dan embed.</p>
          <div className="mt-5! border border-[#2a2d34] bg-[#0b0c0f]">
            <p className="border-b border-[#2a2d34] bg-[#16181c] px-4 py-2 text-xs text-[#8c95a1] sm:text-sm">respons</p>
            <pre className="overflow-x-auto p-5 text-sm leading-7 text-[#e8ebef] sm:text-base">{response}</pre>
          </div>
        </Row>

        <Row label="Batas" icon={<Gauge weight="duotone" />}>
          <div className="grid grid-cols-3 gap-6">
            <Stat value="30" unit="permintaan / menit" />
            <Stat value="1.000" unit="permintaan / hari" />
            <Stat value="10 MB" unit="transkrip / hari" />
          </div>
        </Row>

        <Row label="Privasi" icon={<ShieldCheck weight="duotone" />}>
          <ul className="space-y-2">
            {["Prompt dan percakapan agen tidak disimpan.", "API key disimpan sebagai hash."].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check weight="bold" className="mt-2 size-4 shrink-0 text-[#e28fab]" />
                {item}
              </li>
            ))}
          </ul>
        </Row>

        <SeeAlso
          links={[
            { href: "/panduan", label: "panduan" },
            { href: "/privacy", label: "privasi" },
            { href: "/terms", label: "ketentuan" },
          ]}
        />
      </div>
    </SitePage>
  );
}
