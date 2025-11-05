import { requireAdmin } from "@/lib/auth-admin";
import { getTopUsersByCost, getCostMetrics } from "@/lib/cost-admin-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, MessageSquare, Video, Zap, Calculator } from "lucide-react";
import { AdminNavigation } from "@/components/admin/admin-navigation";

export default async function AdminCostPage() {
  await requireAdmin();

  const [topUsers, metrics] = await Promise.all([
    getTopUsersByCost(20),
    getCostMetrics(),
  ]);

  return (
    <main className="bg-accent dark:bg-background">
      <div className="container max-w-[1328px] w-full mx-auto py-8 px-4">
        <AdminNavigation
          title="Cost Analytics"
          description="LLM usage costs and top spending users"
        />

        {/* Cost Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalCost.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">
                All-time LLM costs
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Users with LLM usage
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                LLM API calls
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost/Request</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.avgCostPerRequest.toFixed(6)}</div>
              <p className="text-xs text-muted-foreground">
                Average per API call
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Users by Cost */}
        <Card className="rounded-xs shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top 10 Users by LLM Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Videos</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Messages</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Tokens</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((user, index) => (
                    <tr key={user.id} className="border-b hover:bg-accent/50 transition-colors cursor-pointer">
                      <td className="py-3 px-4">
                        <a href={`/admin/cost/${user.id}`} className="block">
                          <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <a href={`/admin/cost/${user.id}`} className="block">
                          <div className="flex items-center space-x-3">
                            {user.image && (
                              <img
                                src={user.image}
                                alt={user.name || "User"}
                                className="w-7 h-7 rounded-full"
                              />
                            )}
                            <div>
                              <div className="font-medium text-sm">{user.name || "Anonymous"}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a href={`/admin/cost/${user.id}`} className="block">
                          <span className="text-sm">{user.videoCount}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a href={`/admin/cost/${user.id}`} className="block">
                          <span className="text-sm">{user.messageCount}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a href={`/admin/cost/${user.id}`} className="block">
                          <span className="text-sm">{user.totalTokens.toLocaleString()}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a href={`/admin/cost/${user.id}`} className="block">
                          <span className="text-sm font-medium">${user.totalCost.toFixed(4)}</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {topUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No users with LLM usage found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}