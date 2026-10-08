import type { Metadata } from "next";
import Link from "next/link";
import { AgentDemo } from "@/components/home/agent-demo";
import { InstallTabs } from "@/components/home/install-tabs";
import { KyotoDusk } from "@/components/home/kyoto-dusk";
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

export default function Page() {
  return (
    <main className="min-h-screen bg-[#131518] font-mono text-[#c3c9d1]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
        <Link href="/" className="text-lg font-medium tracking-tight text-[#e8ebef]">
          vidiopintar<span className="text-[#65c9ad]">.</span>
        </Link>
        <Link
          href="/mcp"
          className="text-base text-[#8c95a1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#65c9ad]"
        >
          Panduan
        </Link>
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 pb-24 pt-12 md:pt-20">
        <h1 className="max-w-3xl text-balance text-4xl font-medium leading-tight tracking-tight text-[#e8ebef] sm:text-6xl">
          Transkrip YouTube untuk agen AI.
        </h1>
        <p className="mt-6 text-lg text-[#8c95a1] sm:text-xl">
          Satu alat MCP. Lengkap dengan penanda waktu.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <a
            href={requestAccessHref}
            className="inline-flex min-h-12 items-center bg-[#65c9ad] px-6 text-base font-medium text-[#0d0f12] transition-colors hover:bg-[#8de0c5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65c9ad]"
          >
            Minta akses beta
          </a>
          <Link
            href="/mcp"
            className="text-base text-[#8c95a1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#65c9ad]"
          >
            Baca panduan →
          </Link>
        </div>

        <div className="mt-16">
          <AgentDemo />
        </div>

        <div className="mt-24">
          <h2 className="mb-6 text-2xl font-medium text-[#e8ebef] sm:text-3xl">Pasang</h2>
          <InstallTabs />
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl border-t border-[#25272d] px-6 pb-8 pt-10 text-base text-[#8c95a1]">
        <div className="overflow-hidden">
          <KyotoDusk />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <span>vidiopintar</span>
          <nav aria-label="Tautan layanan" className="flex gap-5">
            <Link className="hover:text-white" href="/privacy">Privasi</Link>
            <Link className="hover:text-white" href="/terms">Ketentuan</Link>
            <a className="hover:text-white" href="mailto:support@vidiopintar.com">Dukungan</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
