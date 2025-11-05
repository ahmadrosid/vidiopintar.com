import { requireAdmin } from "@/lib/auth-admin";
import { getAdminMetrics, getUserGrowthData, getVideoAdditionsData, getTokenUsageData, getTokenUsageByModel, getTokenUsageByOperation, getLatestVideos, getLatestMessages, getTopUsers } from "@/lib/admin-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenUsageOverview } from "@/components/admin/token-usage-overview";
import { Users, Video, FileText, MessageSquare, DollarSign, Zap } from "lucide-react";
import { AdminChartFilters } from "@/components/admin/admin-chart-filters";
import { LatestVideos } from "@/components/admin/latest-videos";
import { LatestMessages } from "@/components/admin/latest-messages";
import { AdminNavigation } from "@/components/admin/admin-navigation";

export default async function AdminPage() {
  await requireAdmin();

  const metrics = await getAdminMetrics();
  const userGrowth7d = await getUserGrowthData("7d");
  const userGrowth1m = await getUserGrowthData("1m");
  const userGrowth3m = await getUserGrowthData("3m");

  const videoAdditions7d = await getVideoAdditionsData("7d");
  const videoAdditions1m = await getVideoAdditionsData("1m");
  const videoAdditions3m = await getVideoAdditionsData("3m");

  const tokenUsage7d = await getTokenUsageData("7d");
  const tokenUsage1m = await getTokenUsageData("1m");
  const tokenUsage3m = await getTokenUsageData("3m");
  const modelUsage = await getTokenUsageByModel();
  const operationUsage = await getTokenUsageByOperation();

  const latestVideos = await getLatestVideos(6);
  const latestMessages = await getLatestMessages(6);
  const topUsers = await getTopUsers(6);

  return (
    <main className="bg-accent dark:bg-background">
      <div className="container max-w-[1328px] w-full mx-auto py-8 px-4">
        <AdminNavigation
          title="Dashboard"
          description="Overview of vidiopintar.com metrics"
        />

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalVideos.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Videos in database
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Videos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUserVideos.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Processed by users
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Chat messages
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <AdminChartFilters 
          userGrowthData={{
            "7d": userGrowth7d,
            "1m": userGrowth1m,
            "3m": userGrowth3m
          }}
          videoAdditionsData={{
            "7d": videoAdditions7d,
            "1m": videoAdditions1m,
            "3m": videoAdditions3m
          }}
        />

        {/* Token Usage Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalTokenRequests.toLocaleString()} API requests
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalTokenCost.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">
                Total LLM costs
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost/Request</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics.totalTokenRequests > 0 ? (metrics.totalTokenCost / metrics.totalTokenRequests).toFixed(6) : '0.000000'}
              </div>
              <p className="text-xs text-muted-foreground">
                Average per API call
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Token Usage Overview and Top Users */}
        <TokenUsageOverview 
          tokenUsageData={{
            "7d": tokenUsage7d,
            "1m": tokenUsage1m,
            "3m": tokenUsage3m
          }}
          modelUsage={modelUsage}
          operationUsage={operationUsage}
          topUsers={topUsers}
        />

        {/* Latest Videos and Messages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <LatestVideos videos={latestVideos} />
          <LatestMessages messages={latestMessages} />
        </div>
      </div>
    </main>
  );
}
