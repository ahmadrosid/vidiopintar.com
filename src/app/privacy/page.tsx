import type { Metadata } from "next";
import Link from "next/link";
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/geo/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Vidiopintar",
  description: "Cara Vidiopintar memproses API key, permintaan transkrip, dan data penggunaan MCP.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

const updated = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(SITE_LAST_MODIFIED);

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#101114] font-mono text-[#dedfe3]">
      <header className="mx-auto flex max-w-3xl justify-between px-6 py-7 text-sm">
        <Link href="/" className="text-[#f0f1f3]">vidiopintar<span className="text-[#65c9ad]">.</span></Link>
        <Link href="/mcp" className="text-[#a1a3aa] underline underline-offset-4">Panduan MCP ↗</Link>
      </header>
      <article className="mx-auto max-w-3xl px-6 pb-20 pt-10">
        <p className="text-xs text-[#65c9ad]">LAYANAN MCP</p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-[#f0f1f3] sm:text-4xl">Kebijakan Privasi</h1>
        <p className="mt-3 text-xs text-[#858891]">Diperbarui {updated}</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-[#b8bac1]">
          <section>
            <h2 className="text-base font-medium text-white">Data yang diproses</h2>
            <p className="mt-2">Saat agen memanggil MCP, layanan memproses URL atau ID video YouTube, kode bahasa, cursor, dan API key. Layanan memakai data ini untuk mengambil dan mengirim transkrip.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-white">API key dan penggunaan</h2>
            <p className="mt-2">Vidiopintar tidak menyimpan API key lengkap. Sistem menyimpan hash key, prefix, nama key, waktu pencabutan, jumlah permintaan, dan jumlah byte keluaran. Key lengkap hanya tampil saat operator membuatnya.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-white">Cache transkrip</h2>
            <p className="mt-2">Layanan menyimpan segmen transkrip dan metadata video dalam cache selama tujuh hari. Pembersihan berjalan saat ada permintaan MCP. Cache dapat tersimpan lebih lama jika layanan tidak menerima permintaan atau pembersihan gagal.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-white">Masa simpan data penggunaan</h2>
            <p className="mt-2">Sistem menghapus catatan kuota yang lebih lama dari 90 hari. Sistem juga menghapus catatan key yang sudah dicabut setelah 90 hari. Saat operator mencabut key, sistem mengganti hash key agar key lama tidak dapat digunakan lagi.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-white">Penyedia layanan</h2>
            <p className="mt-2">Vidiopintar meminta caption dari YouTube. YouTube memproses permintaan menurut kebijakan dan ketentuannya sendiri. Penyedia hosting juga dapat memproses data teknis untuk menjalankan layanan.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-white">Percakapan agen</h2>
            <p className="mt-2">MCP tidak menyimpan prompt atau riwayat percakapan agen. Jangan kirim informasi sensitif melalui input video, bahasa, atau cursor.</p>
          </section>
          <section>
            <h2 className="text-base font-medium text-white">Permintaan privasi</h2>
            <p className="mt-2">Untuk meminta akses atau penghapusan data key, hubungi <a className="text-[#8de0c5] underline underline-offset-4" href="mailto:support@vidiopintar.com">support@vidiopintar.com</a>. Sertakan prefix key. Jangan kirim API key lengkap.</p>
          </section>
        </div>

        <nav className="mt-12 flex gap-5 border-t border-[#303239] pt-5 text-xs text-[#858891]">
          <Link className="hover:text-white" href="/terms">Ketentuan layanan</Link>
          <Link className="hover:text-white" href="/mcp">Panduan MCP</Link>
          <a className="hover:text-white" href="mailto:support@vidiopintar.com">Dukungan</a>
        </nav>
      </article>
    </main>
  );
}
