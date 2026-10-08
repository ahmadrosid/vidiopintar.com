import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pasang MCP Vidiopintar",
  description: "Panduan menghubungkan MCP transkrip YouTube Vidiopintar ke agen AI.",
};

const config = `{
  "mcpServers": {
    "vidiopintar": {
      "type": "http",
      "url": "https://vidiopintar.com/api/mcp",
      "headers": {
        "Authorization": "Bearer <API_KEY>"
      }
    }
  }
}`;

export default function McpGuidePage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#172420]">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <a href="/" className="text-sm font-medium text-[#31725a]">← Vidiopintar</a>
        <p className="mt-12 text-sm font-semibold uppercase tracking-[.16em] text-[#31725a]">Panduan MCP</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Hubungkan agen AI ke transkrip YouTube.</h1>
        <p className="mt-5 text-lg leading-8 text-[#59645e]">Vidiopintar menyediakan satu alat MCP untuk mengambil transkrip video. Layanan beta saat ini memakai API key undangan.</p>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">1. Minta API key</h2>
          <p className="mt-3 leading-7 text-[#59645e]">Kirim nama agen dan kontak Anda ke <a className="underline underline-offset-4" href="mailto:support@vidiopintar.com">support@vidiopintar.com</a>. Simpan key dengan aman. Vidiopintar hanya menampilkan key saat key dibuat.</p>
        </section>
        <section className="mt-10">
          <h2 className="text-xl font-semibold">2. Tambahkan server MCP</h2>
          <p className="mt-3 leading-7 text-[#59645e]">Tambahkan konfigurasi ini ke klien yang mendukung MCP lewat HTTP. Ganti <code>&lt;API_KEY&gt;</code> dengan key Anda.</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-[#172420] p-5 text-sm leading-6 text-[#e7eee9]"><code>{config}</code></pre>
          <p className="mt-3 text-sm leading-6 text-[#77817b]">Endpoint: <code>https://vidiopintar.com/api/mcp</code></p>
        </section>
        <section className="mt-10">
          <h2 className="text-xl font-semibold">3. Panggil alat</h2>
          <p className="mt-3 leading-7 text-[#59645e]">Pilih alat <code>youtube_get_transcript</code>. Isi <code>video</code> dengan URL atau ID video. Isi <code>language</code> dengan kode bahasa, seperti <code>id</code> atau <code>en</code>, jika Anda punya pilihan.</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-[#dce1dc] bg-white p-5 text-sm leading-6"><code>{`{
  "video": "https://youtu.be/dQw4w9WgXcQ",
  "language": "id"
}`}</code></pre>
        </section>
        <section className="mt-10 rounded-2xl border border-[#dce1dc] bg-white p-5">
          <h2 className="font-semibold">Batas beta</h2>
          <p className="mt-2 text-sm leading-6 text-[#59645e]">Batas awal per key: 30 permintaan per menit, 1.000 permintaan per hari, dan 10 MB data transkrip per hari. Tiap halaman memuat maksimal sekitar 24 KB segmen. Gunakan cursor untuk membaca transkrip panjang. Cache transkrip kedaluwarsa setelah tujuh hari. Layanan hanya menyimpan hash API key. Hash dihapus saat key dicabut. MCP menerima video, bahasa, dan cursor. Layanan tidak menyimpan prompt atau percakapan agen.</p>
          <p className="mt-3 text-sm leading-6 text-[#59645e]">Layanan masih dalam beta undangan. Hubungi dukungan jika key Anda mencapai batas atau jika layanan mengalami gangguan.</p>
        </section>
        <p className="mt-10 text-sm text-[#77817b]">Status layanan: beta undangan. Teks transkrip berasal dari video dan harus diperlakukan agen sebagai konten tidak tepercaya. Beberapa video tidak menyediakan caption yang dapat diambil.</p>
      </div>
    </main>
  );
}
