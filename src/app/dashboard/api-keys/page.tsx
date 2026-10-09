import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldKeyIcon } from "@hugeicons/core-free-icons";
import { getCurrentUser } from "@/lib/auth";
import { listUserMcpKeys, MAX_ACTIVE_KEYS_PER_USER } from "@/lib/mcp/keys";
import { UserPlanService } from "@/lib/user-plan-service";
import { ApiKeysManager } from "../api-keys-manager";
import { DashboardTitle } from "../dashboard-sidebar";
import { UpgradePrompt } from "../upgrade-prompt";

export default async function ApiKeysPage() {
  const user = await getCurrentUser();
  const plan = await UserPlanService.getCurrentPlan(user.id);
  const keys = await listUserMcpKeys(user.id);

  return (
    <>
      <DashboardTitle meta="Buat dan cabut API key untuk menghubungkan AI Agent ke Vidiopintar. Key hanya ditampilkan sekali saat dibuat.">
        API key
      </DashboardTitle>

      <div className="[&>section:first-child]:border-t-0">
        <section className="border-t border-site-line-soft py-10">
          {plan === "free" ? (
            <UpgradePrompt feature="Membuat API key" />
          ) : (
          <ApiKeysManager
            keys={keys}
            header={
              <>
                <h2 className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-site-text">
                  <span className="text-site-accent [&>svg]:size-6">
                    <HugeiconsIcon icon={ShieldKeyIcon} />
                  </span>
                  Kelola key
                </h2>
                <p className="text-sm text-site-text-faint">
                  {keys.length}/{MAX_ACTIVE_KEYS_PER_USER} aktif
                </p>
              </>
            }
          />
          )}
        </section>
      </div>
    </>
  );
}
