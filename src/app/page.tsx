import type { Metadata } from "next";
import Link from "next/link";
import { DeepReef } from "@/components/home/deep-reef";
import { SITE_URL } from "@/lib/geo/site";

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
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <Link href="/" className="text-sm font-medium tracking-tight text-[#e8ebef]">
          vidiopintar<span className="text-[#65c9ad]">.</span>
        </Link>
        <Link
          href="/mcp"
          className="text-sm text-[#8c95a1] underline decoration-[#484a52] underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#65c9ad]"
        >
          Panduan MCP ↗
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-20 pt-8 md:pt-12">
        <p className="text-sm text-[#8c95a1]">MCP · TRANSKRIP YOUTUBE</p>
        <h1 className="mt-3 max-w-3xl text-balance text-xl font-medium leading-relaxed text-[#e8ebef] sm:text-2xl">
          Ambil transkrip YouTube lewat satu alat MCP.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8c95a1]">
          Agen AI dapat meminta transkrip video dengan penanda waktu lewat endpoint yang sama.
        </p>

        <div className="mt-8 overflow-hidden bg-[#03101a]">
          <DeepReef />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <Link
            href="/mcp"
            className="inline-flex min-h-11 items-center border border-[#65c9ad] px-4 text-sm text-[#8de0c5] transition-colors hover:bg-[#16352f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65c9ad]"
          >
            Lihat panduan pemasangan ↗
          </Link>
          <span className="text-xs text-[#858891]">Beta undangan · memerlukan API key</span>
        </div>

        <div className="mt-10 border-t border-[#303239] pt-5">
          <p className="text-xs text-[#8c95a1]">Endpoint MCP</p>
          <code className="mt-2 block break-all text-xs text-[#c9cbd1] sm:text-sm">
            https://vidiopintar.com/api/mcp
          </code>
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-[#25272d] px-6 py-6 text-sm text-[#8c95a1]">
        <span>Vidiopintar · MCP transkrip YouTube</span>
        <nav aria-label="Tautan layanan" className="flex gap-5">
          <Link className="hover:text-white" href="/privacy">Privasi</Link>
          <Link className="hover:text-white" href="/terms">Ketentuan</Link>
          <a className="hover:text-white" href="mailto:support@vidiopintar.com">Dukungan</a>
        </nav>
      </footer>
    </main>
  );
}
