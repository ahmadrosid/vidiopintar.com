import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, CheckIcon, FunctionIcon, GaugeIcon, ShieldCheckIcon, TerminalIcon } from "@hugeicons/core-free-icons";
import type { Metadata } from "next";
import { InstallTabs } from "@/components/home/install-tabs";
import { KyotoDusk } from "@/components/home/kyoto-dusk";
import Link from "next/link";
import { PageTitle, Row, SeeAlso, SitePage, Stat } from "@/components/site/site-page";
import { SITE_URL } from "@/lib/geo/site";

export const metadata: Metadata = {
  title: "Transkrip YouTube untuk AI Agent",
  description: "MCP (Model Context Protocol) untuk memberi AI Agent akses ke transkrip YouTube dengan penanda waktu.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Transkrip YouTube untuk AI Agent | Vidiopintar",
    description: "MCP (Model Context Protocol) untuk memberi AI Agent akses ke transkrip YouTube dengan penanda waktu.",
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
        <span className="text-site-accent">vidiopintar</span> — transkrip YouTube untuk AI Agent.
      </PageTitle>

      <div className="-mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Link
          href="/dashboard"
          className="inline-flex min-h-12 items-center gap-2 bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
        >
          Buat API key <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-5" />
        </Link>
        <Link href="/panduan" className="text-base text-site-text-2 underline decoration-site-line-strong underline-offset-4 hover:text-site-text">
          Panduan
        </Link>
      </div>

      <div className="mt-16 sm:mt-20 lg:mt-24 [&>section:first-child]:border-t-0">
        <Row label="Pasang" icon={<HugeiconsIcon icon={TerminalIcon} />} wide>
          <p className="text-site-text-2">MCP (Model Context Protocol) untuk memberi AI Agent akses ke transkrip YouTube dengan penanda waktu.</p>
          <InstallTabs />
        </Row>

        <Row label="Alat" icon={<HugeiconsIcon icon={FunctionIcon} />}>
          <p>
            <span className="text-site-text">youtube_get_transcript</span>
            <span className="text-site-text-faint">(video, language?, cursor?)</span>
          </p>
          <p className="text-site-text-muted">URL atau ID video. Mendukung watch, youtu.be, shorts, dan embed.</p>
          <div className="mt-5! border border-site-line bg-site-panel">
            <p className="border-b border-site-line bg-site-header px-4 py-2 text-xs text-site-text-muted sm:text-sm">respons</p>
            <pre className="overflow-x-auto p-5 text-sm leading-7 text-site-text sm:text-base">{response}</pre>
          </div>
        </Row>

        <Row label="Batas" icon={<HugeiconsIcon icon={GaugeIcon} />}>
          <div className="grid grid-cols-2 gap-6">
            <Stat value="1.000" unit="panggilan MCP / bulan" />
            <Stat value="12.000" unit="panggilan MCP / tahun" />
          </div>
        </Row>

        <Row label="Privasi" icon={<HugeiconsIcon icon={ShieldCheckIcon} />}>
          <ul className="space-y-2">
            {[
              "Prompt dan percakapan agen tidak disimpan.",
              "API key disimpan sebagai hash.",
              "Riwayat permintaan di dashboard (ID video, hasil, durasi) disimpan selama 90 hari.",
              "Transkrip disimpan di cache selama tujuh hari.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <HugeiconsIcon icon={CheckIcon} className="mt-2 size-4 shrink-0 text-site-accent" />
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
