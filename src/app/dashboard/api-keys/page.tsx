import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldKeyIcon } from "@hugeicons/core-free-icons";
import { Row } from "@/components/site/site-page";
import { getCurrentUser } from "@/lib/auth";
import { listUserMcpKeys, MAX_ACTIVE_KEYS_PER_USER } from "@/lib/mcp/keys";
import { ApiKeysManager } from "../api-keys-manager";
import { DashboardTitle } from "../dashboard-sidebar";

export default async function ApiKeysPage() {
  const user = await getCurrentUser();
  const keys = await listUserMcpKeys(user.id);

  return (
    <>
      <DashboardTitle meta="Buat dan cabut API key untuk menghubungkan AI Agent ke Vidiopintar. Key hanya ditampilkan sekali saat dibuat.">
        API key
      </DashboardTitle>

      <div className="[&>section:first-child]:border-t-0">
        <Row label="Kelola key" icon={<HugeiconsIcon icon={ShieldKeyIcon} />} wide>
          <p className="text-sm text-site-text-faint">
            {keys.length}/{MAX_ACTIVE_KEYS_PER_USER} aktif
          </p>
          <ApiKeysManager keys={keys} />
        </Row>
      </div>
    </>
  );
}
