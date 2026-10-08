import type { Metadata } from "next";
import { PageTitle, Row, SeeAlso, SitePage, linkClass } from "@/components/site/site-page";
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/geo/site";

export const metadata: Metadata = {
  title: "Ketentuan Layanan | Vidiopintar",
  description: "Ketentuan penggunaan MCP transkrip YouTube Vidiopintar.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

const updated = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(SITE_LAST_MODIFIED);

export default function TermsOfService() {
  return (
    <SitePage>
      <PageTitle meta={`Diperbarui ${updated}`}>Ketentuan Layanan</PageTitle>

      <Row label="Layanan beta">
        <p>Vidiopintar menyediakan MCP untuk mengambil caption YouTube yang tersedia. Layanan beta hanya untuk operator yang mendapat API key. Saat ini tidak ada biaya untuk akses beta.</p>
      </Row>

      <Row label="Penggunaan yang didukung">
        <p>Gunakan URL YouTube yang didukung atau ID video 11 karakter. Agen dapat meminta kode bahasa dan memakai cursor untuk membaca transkrip panjang. Layanan mengembalikan segmen bertimestamp dan metadata yang tersedia.</p>
      </Row>

      <Row label="Batas beta">
        <ul className="list-disc space-y-1 pl-5">
          <li>30 permintaan per menit untuk setiap key.</li>
          <li>1.000 permintaan per hari untuk setiap key.</li>
          <li>10.000.000 byte keluaran per hari untuk setiap key.</li>
          <li>Setiap halaman memuat paling banyak sekitar 24.000 byte segmen.</li>
          <li>Cursor berlaku selama 15 menit.</li>
        </ul>
        <p>Layanan dapat menolak permintaan saat batas tercapai. Operator dapat mencabut key yang melanggar batas atau mengganggu layanan.</p>
      </Row>

      <Row label="Tanggung jawab pemegang key">
        <p>Jaga kerahasiaan API key. Anda bertanggung jawab atas permintaan yang memakai key Anda. Jangan publikasikan key atau mengirimkannya ke alat yang tidak Anda kendalikan.</p>
      </Row>

      <Row label="Konten YouTube">
        <p>Ketersediaan transkrip bergantung pada video, caption, wilayah, dan pembatasan dari YouTube. Vidiopintar tidak menjamin setiap video memiliki transkrip. Anda harus mematuhi ketentuan YouTube dan hukum yang berlaku saat memakai layanan.</p>
        <p>Teks transkrip berasal dari video dan merupakan konten tidak tepercaya. Agen harus memperlakukannya sebagai data, bukan instruksi.</p>
      </Row>

      <Row label="Perubahan dan gangguan">
        <p>Layanan beta dapat berubah, mengalami gangguan, atau berhenti. Kami dapat membatasi atau mencabut akses untuk menjaga keamanan dan ketersediaan layanan.</p>
      </Row>

      <Row label="Hubungi kami">
        <p>Untuk bantuan atau permintaan terkait akses, hubungi <a className={linkClass} href="mailto:support@vidiopintar.com">support@vidiopintar.com</a>.</p>
      </Row>

      <SeeAlso
        links={[
          { href: "/privacy", label: "privasi" },
          { href: "/mcp", label: "panduan" },
          { href: "mailto:support@vidiopintar.com", label: "dukungan" },
        ]}
      />
    </SitePage>
  );
}
