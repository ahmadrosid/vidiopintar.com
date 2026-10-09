import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon, CheckIcon } from "@hugeicons/core-free-icons";
import type { Metadata } from "next";
import { InstallTabs } from "@/components/home/install-tabs";
import { KyotoDusk } from "@/components/home/kyoto-dusk";
import Link from "next/link";
import { PageTitle, Row, SitePage } from "@/components/site/site-page";
import { SITE_URL } from "@/lib/geo/site";

export const metadata: Metadata = {
  title: "Transkrip YouTube untuk AI Agent",
  description:
    "MCP (Model Context Protocol) untuk memberi AI Agent akses ke transkrip YouTube dengan penanda waktu.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Transkrip YouTube untuk AI Agent | Vidiopintar",
    description:
      "MCP (Model Context Protocol) untuk memberi AI Agent akses ke transkrip YouTube dengan penanda waktu.",
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
      <PageTitle>Hubungkan AI Agent ke transkrip YouTube.</PageTitle>

      <p className="-mt-10 max-w-2xl border-l-2 border-site-accent bg-site-bg/95 px-5 py-4 text-lg leading-8 text-site-text sm:text-xl">
        Hubungkan Vidiopintar ke AI Agent Anda. Agen dapat mengambil transkrip
        YouTube lengkap dengan penanda waktu.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Link
          href="/dashboard"
          className="inline-flex min-h-12 items-center gap-2 bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
        >
          Buat API key{" "}
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-5" />
        </Link>
        <Link
          href="#cara-mulai"
          className="text-base text-site-text-2 underline decoration-site-line-strong underline-offset-4 hover:text-site-text"
        >
          Lihat konfigurasi
        </Link>
      </div>

      <div className="mt-16 sm:mt-20 lg:mt-24 [&>div:first-child>section]:border-t-0">
        <div id="cara-mulai">
          <Row label="Cara mulai" wide>
            <p>
              Buat API key, salin konfigurasi untuk klien Anda, lalu minta agen
              memanggil{" "}
              <code className="text-site-text">youtube_get_transcript</code>.
            </p>
            <InstallTabs />
            <Link
              href="/panduan"
              className="text-base text-site-text-2 underline decoration-site-line-strong underline-offset-4 hover:text-site-text"
            >
              Lihat langkah pemasangan
            </Link>
          </Row>
        </div>

        <Row label="Pilih paket" wide>
          <ul className="space-y-2">
            <li>
              AI Anda mendapat teks video dan waktu saat tiap bagian diucapkan,
              agar Anda mudah menemukan bagian yang dicari.
            </li>
            <li>Tempel tautan YouTube, termasuk tautan pendek dan Shorts.</li>
            <li>
              Pilih bahasa transkrip. Untuk video panjang, lanjutkan mengambil
              teks dari bagian terakhir.
            </li>
          </ul>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col border border-site-line bg-site-panel p-5">
              <p className="text-sm text-site-text-muted">Bulanan</p>
              <p className="mt-2 font-display text-3xl font-bold text-site-text">
                IDR 50.000
              </p>
              <p className="text-sm text-site-text-muted">per bulan</p>
              <ul className="mt-4 flex-1 space-y-2 text-base leading-7">
                <li>1.000 panggilan MCP</li>
                <li>Transkrip video tanpa batas</li>
                <li>Dukungan email</li>
              </ul>
              <Link
                href="/payment?plan=monthly"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 border border-site-line-strong px-4 font-display font-bold text-site-text transition-colors hover:bg-site-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
              >
                Pilih bulanan
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
              </Link>
            </div>
            <div className="flex flex-col border border-site-accent bg-site-panel p-5">
              <p className="text-sm text-site-text-muted">Tahunan</p>
              <p className="mt-2 font-display text-3xl font-bold text-site-text">
                IDR 500.000
              </p>
              <p className="text-sm text-site-text-muted">
                per tahun · harga normal IDR 600.000
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-base leading-7">
                <li>12.000 panggilan MCP</li>
                <li>Transkrip video tanpa batas</li>
                <li>Dukungan email dan prioritas</li>
              </ul>
              <Link
                href="/payment?plan=yearly"
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 bg-site-accent-fill px-4 font-display font-bold text-site-bg transition-colors hover:bg-site-accent-fill-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
              >
                Pilih tahunan
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
              </Link>
            </div>
          </div>
        </Row>

        <Row label="Format hasil" wide>
          <p>Permintaan dan hasil transkrip mengikuti format terstruktur:</p>
          <p>
            <span className="text-site-text">youtube_get_transcript</span>
            <span className="text-site-text-faint">
              (video, language?, cursor?)
            </span>
          </p>
          <p className="text-site-text-muted">
            URL atau ID video. Mendukung watch, youtu.be, shorts, dan embed.
          </p>
          <div className="mt-5! border border-site-line bg-site-panel">
            <p className="border-b border-site-line bg-site-header px-4 py-2 text-xs text-site-text-muted sm:text-sm">
              respons
            </p>
            <pre className="overflow-x-auto p-5 text-sm leading-7 text-site-text sm:text-base">
              {response}
            </pre>
          </div>
        </Row>

        <Row label="Pertanyaan umum" wide>
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-site-text">
                Apakah semua video punya transkrip?
              </h3>
              <p>
                Belum tentu. Video perlu memiliki transkrip yang dapat diakses;
                permintaan dapat gagal jika transkrip tidak tersedia.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-site-text">
                Bagaimana cara menghubungkan layanan?
              </h3>
              <p>
                Buat API key di dashboard, lalu ikuti konfigurasi untuk klien
                Anda di{" "}
                <Link
                  href="/panduan"
                  className="underline decoration-site-line-strong underline-offset-4"
                >
                  panduan
                </Link>
                .
              </p>
            </div>
          </div>
        </Row>

        <Row label="Privasi" wide>
          <ul className="space-y-2">
            {[
              "Prompt dan percakapan agen tidak disimpan.",
              "API key disimpan sebagai hash.",
              "Transkrip disimpan di cache selama tujuh hari.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={CheckIcon}
                  className="mt-2 size-4 shrink-0 text-site-accent"
                />
                {item}
              </li>
            ))}
          </ul>
        </Row>

        <Row label="Lihat juga" wide>
          <nav aria-label="Tautan terkait" className="flex flex-wrap gap-6">
            <Link
              href="/panduan"
              className="underline decoration-site-line-strong underline-offset-4 hover:text-site-text"
            >
              Panduan
            </Link>
            <Link
              href="/privacy"
              className="underline decoration-site-line-strong underline-offset-4 hover:text-site-text"
            >
              Privasi
            </Link>
            <Link
              href="/terms"
              className="underline decoration-site-line-strong underline-offset-4 hover:text-site-text"
            >
              Ketentuan
            </Link>
          </nav>
        </Row>
      </div>
    </SitePage>
  );
}
