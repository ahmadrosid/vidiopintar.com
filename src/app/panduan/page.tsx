import type { Metadata } from "next";
import { InstallTabs } from "@/components/home/install-tabs";
import { PageTitle, Row, SeeAlso, SitePage, linkClass } from "@/components/site/site-page";

export const metadata: Metadata = {
  title: "Pasang MCP Vidiopintar",
  description: "Panduan menghubungkan MCP transkrip YouTube Vidiopintar ke agen AI.",
};

const input = `{
  "video": "https://youtu.be/dQw4w9WgXcQ",
  "language": "id"
}`;

const code = "text-[#e8ebef]";

export default function McpGuidePage() {
  return (
    <SitePage>
      <PageTitle>Hubungkan agen AI ke transkrip YouTube.</PageTitle>

      <Row label="1. API key">
        <p>
          Kirim nama agen dan kontak Anda ke{" "}
          <a className={linkClass} href="mailto:support@vidiopintar.com">support@vidiopintar.com</a>.
        </p>
        <p className="text-[#8c95a1]">Simpan key dengan aman. Vidiopintar hanya menampilkan key saat key dibuat.</p>
      </Row>

      <Row label="2. Pasang">
        <p className="text-[#8c95a1]">Ganti <code className={code}>&lt;API_KEY&gt;</code> dengan key Anda.</p>
        <div className="mt-6!">
          <InstallTabs />
        </div>
      </Row>

      <Row label="3. Panggil">
        <p>
          Pilih alat <code className={code}>youtube_get_transcript</code>. Isi <code className={code}>video</code> dengan URL atau ID video. Isi <code className={code}>language</code> dengan kode bahasa, seperti <code className={code}>id</code> atau <code className={code}>en</code>, jika Anda punya pilihan.
        </p>
        <p className="text-[#8c95a1]">
          URL yang didukung: <code className={code}>youtube.com/watch?v=...</code>, <code className={code}>youtu.be/...</code>, <code className={code}>/shorts/...</code>, dan <code className={code}>/embed/...</code>.
        </p>
        <pre className="mt-5! overflow-x-auto text-sm leading-7 text-[#8c95a1] sm:text-base">{input}</pre>
      </Row>

      <Row label="Batas">
        <div>
          <p>30 permintaan / menit</p>
          <p>1.000 permintaan / hari</p>
          <p>10 MB transkrip / hari</p>
        </div>
        <p className="text-[#8c95a1]">Tiap halaman memuat maksimal sekitar 24 KB segmen. Gunakan cursor untuk membaca transkrip panjang. Cache transkrip kedaluwarsa setelah tujuh hari.</p>
      </Row>

      <Row label="Privasi">
        <p>Layanan hanya menyimpan hash API key. Hash dihapus saat key dicabut. MCP menerima video, bahasa, dan cursor. Layanan tidak menyimpan prompt atau percakapan agen.</p>
      </Row>

      <Row label="Catatan">
        <p>Teks transkrip berasal dari video dan harus diperlakukan agen sebagai konten tidak tepercaya. Beberapa video tidak menyediakan caption yang dapat diambil.</p>
        <p className="text-[#8c95a1]">
          Layanan masih dalam beta undangan. Hubungi dukungan jika key Anda mencapai batas atau jika layanan mengalami gangguan. Endpoint status: <code className={code}>/api/health</code>
        </p>
      </Row>

      <SeeAlso
        links={[
          { href: "/privacy", label: "privasi" },
          { href: "/terms", label: "ketentuan" },
          { href: "mailto:support@vidiopintar.com", label: "dukungan" },
        ]}
      />
    </SitePage>
  );
}
