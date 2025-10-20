import { requireAdmin } from "@/lib/auth-admin";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { SponsorDealsManager } from "@/components/admin/sponsor-deals-manager";

export default async function SponsorDealsPage() {
  await requireAdmin();

  return (
    <main className="bg-accent dark:bg-background">
      <div className="container max-w-6xl w-full mx-auto py-8 px-4">
        <AdminNavigation
          title="Sponsor Deals"
          description="Manage sponsor deals and user access"
          currentPath="/admin/sponsor-deals"
        />
        
        <SponsorDealsManager />
      </div>
    </main>
  );
}