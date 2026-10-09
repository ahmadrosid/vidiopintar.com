import type { Metadata } from "next";
import { PageTitle, Row, SeeAlso, SitePage, linkClass } from "@/components/site/site-page";
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
    <SitePage>
      <PageTitle meta={`Diperbarui ${updated}`}>Kebijakan Privasi</PageTitle>

      <Row label="Data yang diproses">
        <p>Saat agen memanggil MCP, layanan memproses URL atau ID video YouTube, kode bahasa, cursor, dan API key. Layanan memakai data ini untuk mengambil dan mengirim transkrip.</p>
      </Row>

      <Row label="API key dan penggunaan">
        <p>Vidiopintar tidak menyimpan API key lengkap. Sistem menyimpan hash key, prefix, nama key, akun pemilik key, waktu pencabutan, jumlah permintaan, dan jumlah byte keluaran. Untuk riwayat di dashboard, sistem juga mencatat waktu, ID video, hasil, dan durasi setiap permintaan selama 90 hari. Key lengkap hanya tampil sekali, saat key dibuat.</p>
      </Row>

      <Row label="Cache transkrip">
        <p>Layanan menyimpan segmen transkrip dan metadata video dalam cache selama tujuh hari. Pembersihan berjalan saat ada permintaan MCP. Cache dapat tersimpan lebih lama jika layanan tidak menerima permintaan atau pembersihan gagal.</p>
      </Row>

      <Row label="Masa simpan data penggunaan">
        <p>Sistem menghapus catatan kuota yang lebih lama dari 90 hari. Sistem juga menghapus catatan key yang sudah dicabut setelah 90 hari. Saat operator mencabut key, sistem mengganti hash key agar key lama tidak dapat digunakan lagi.</p>
      </Row>

      <Row label="Penyedia layanan">
        <p>Vidiopintar meminta caption dari YouTube. YouTube memproses permintaan menurut kebijakan dan ketentuannya sendiri. Penyedia hosting juga dapat memproses data teknis untuk menjalankan layanan.</p>
      </Row>

      <Row label="Percakapan agen">
        <p>MCP tidak menyimpan prompt atau riwayat percakapan agen. Jangan kirim informasi sensitif melalui input video, bahasa, atau cursor.</p>
      </Row>

      <Row label="Permintaan privasi">
        <p>Untuk meminta akses atau penghapusan data key, hubungi <a className={linkClass} href="mailto:support@vidiopintar.com">support@vidiopintar.com</a>. Sertakan prefix key. Jangan kirim API key lengkap.</p>
      </Row>

      <SeeAlso
        links={[
          { href: "/terms", label: "ketentuan" },
          { href: "/panduan", label: "panduan" },
          { href: "mailto:support@vidiopintar.com", label: "dukungan" },
        ]}
      />
    </SitePage>
  );
}
