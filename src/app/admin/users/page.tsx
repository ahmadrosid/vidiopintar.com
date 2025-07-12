import { requireAdmin } from "@/lib/auth-admin";
import { getRetentionMetrics, getUserActivityData, getUserSegmentData, getRecentActiveUsers } from "@/lib/users-admin-queries";
import { getTopUsers } from "@/lib/admin-queries";
import { RetentionOverview } from "@/components/admin/retention-overview";
import { TopUsers } from "@/components/admin/top-users";
import { RecentActiveUsers } from "@/components/admin/recent-active-users";
import { RetentionDashboardData } from "@/types/admin";
import { AdminNavigation } from "@/components/admin/admin-navigation";

export default async function AdminUsersPage() {
  await requireAdmin();

  const [metrics, activityData, segments, topUsers, recentActiveUsers] = await Promise.all([
    getRetentionMetrics(),
    getUserActivityData(),
    getUserSegmentData(),
    getTopUsers(5),
    getRecentActiveUsers(5),
  ]);

  const dashboardData: RetentionDashboardData = {
    metrics,
    activityData,
    segments,
  };

  return (
    <main className="bg-accent dark:bg-background">
      <div className="container max-w-6xl w-full mx-auto py-8 px-4">
        <AdminNavigation
          title="User Analytics Dashboard"
          description="User retention and engagement insights for vidiopintar.com"
        />

        <RetentionOverview data={dashboardData} />
        
        {/* User Lists Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopUsers users={topUsers} />
          <RecentActiveUsers users={recentActiveUsers} />
        </div>
      </div>
    </main>
  );
}