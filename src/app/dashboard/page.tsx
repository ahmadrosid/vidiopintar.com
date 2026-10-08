import Link from "next/link";
import { Gauge, Key, TerminalWindow, UserCircle } from "@phosphor-icons/react/ssr";
import { PageTitle, Row, Stat, linkClass } from "@/components/site/site-page";
import { getCurrentUser } from "@/lib/auth";
import { listUserMcpKeys, MAX_ACTIVE_KEYS_PER_USER } from "@/lib/mcp/keys";
import { ApiKeysManager } from "./api-keys-manager";
import { DeleteAccount } from "./delete-account";

const numberFormat = new Intl.NumberFormat("id-ID");

function formatMegabytes(bytes: number) {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(bytes / 1_000_000)} MB`;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const keys = await listUserMcpKeys(user.id);
  const requestsToday = keys.reduce((sum, key) => sum + key.requestsToday, 0);
  const bytesToday = keys.reduce((sum, key) => sum + key.bytesToday, 0);

  return (
    <>
      <PageTitle meta={user.email}>Dashboard</PageTitle>

      <div className="[&>section:first-child]:border-t-0">
        <Row label="API key" icon={<Key weight="duotone" />}>
          <p className="text-[#8c95a1]">
            Hingga {MAX_ACTIVE_KEYS_PER_USER} key aktif. Key lengkap hanya tampil sekali, saat dibuat.
          </p>
          <ApiKeysManager keys={keys} />
        </Row>

        <Row label="Hari ini" icon={<Gauge weight="duotone" />}>
          <div className="grid grid-cols-2 gap-6">
            <Stat value={numberFormat.format(requestsToday)} unit="permintaan" />
            <Stat value={formatMegabytes(bytesToday)} unit="transkrip" />
          </div>
          <p className="text-sm text-[#6f7782]">
            Batas berlaku per key: 30 permintaan per menit, 1.000 per hari, dan 10 MB per hari. Dihitung ulang setiap
            pukul 07.00 WIB.
          </p>
        </Row>

        <Row label="Pasang" icon={<TerminalWindow weight="duotone" />}>
          <p>
            Tambahkan key ke klien MCP Anda. Konfigurasi untuk Claude Code, Codex, Cursor, dan lainnya ada di{" "}
            <Link href="/panduan#pasang" className={linkClass}>panduan</Link>.
          </p>
        </Row>

        <Row label="Akun" icon={<UserCircle weight="duotone" />}>
          <p>
            Masuk sebagai <span className="text-[#e8ebef]">{user.name}</span>. Ubah nama, email, atau kata sandi lewat menu
            Akun di atas.
          </p>
          <DeleteAccount />
        </Row>
      </div>
    </>
  );
}
