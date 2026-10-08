import type { Metadata } from "next";
import { InstallTabs } from "@/components/home/install-tabs";
import { KyotoDusk } from "@/components/home/kyoto-dusk";
import { PageTitle, Row, SeeAlso, SitePage, linkClass } from "@/components/site/site-page";
import { SITE_URL } from "@/lib/geo/site";

const requestAccessHref = `mailto:support@vidiopintar.com?subject=${encodeURIComponent("Minta akses beta MCP Vidiopintar")}&body=${encodeURIComponent("Nama agen/aplikasi:\nKontak:\nKegunaan:\n")}`;

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
        <span className="text-[#65c9ad]">vidiopintar</span> — transkrip YouTube untuk agen AI.
      </PageTitle>

      <div className="mt-48 sm:mt-[28vw] lg:mt-80">
        <Row label="Pasang">
          <InstallTabs />
        </Row>

        <Row label="Alat">
          <p>
            <span className="text-[#e8ebef]">youtube_get_transcript</span>
            <span className="text-[#6f7782]">(video, language?, cursor?)</span>
          </p>
          <p className="text-[#8c95a1]">URL atau ID video. Mendukung watch, youtu.be, shorts, dan embed.</p>
          <pre className="mt-5! overflow-x-auto text-sm leading-7 text-[#8c95a1] sm:text-base">{response}</pre>
        </Row>

        <Row label="Batas">
          <div className="space-y-0">
            <p>30 permintaan / menit</p>
            <p>1.000 permintaan / hari</p>
            <p>10 MB transkrip / hari</p>
          </div>
        </Row>

        <Row label="Privasi">
          <div className="space-y-0">
            <p>Prompt dan percakapan agen tidak disimpan.</p>
            <p>API key disimpan sebagai hash.</p>
          </div>
        </Row>

        <Row label="Akses">
          <p>
            Beta undangan. Minta key ke{" "}
            <a href={requestAccessHref} className={linkClass}>support@vidiopintar.com</a>
          </p>
        </Row>

        <SeeAlso
          links={[
            { href: "/mcp", label: "panduan" },
            { href: "/privacy", label: "privasi" },
            { href: "/terms", label: "ketentuan" },
          ]}
        />
      </div>
    </SitePage>
  );
}
