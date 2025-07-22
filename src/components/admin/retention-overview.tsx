"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RetentionMetricsCards } from "./retention-metrics-cards";
import { UserActivityChart } from "./retention-chart";
import { RetentionCohortView } from "./retention-cohort-view";
import { Users } from "lucide-react";
import { RetentionDashboardData } from "@/types/admin";

interface RetentionOverviewProps {
  data: RetentionDashboardData;
}

export function RetentionOverview({ data }: RetentionOverviewProps) {
  const { metrics, activityData, segments } = data;

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <RetentionMetricsCards metrics={metrics} />

      {/* Retention Cohorts */}
      <RetentionCohortView initialCohorts={metrics.cohorts} />

      {/* Retention Chart and User Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Activity Chart */}
        <div className="lg:col-span-2">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Activity Over Time</CardTitle>
                <CardDescription>
                  Daily active users and video processing over the last 30 days
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {activityData.length > 0 ? (
                <UserActivityChart data={activityData} />
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No activity data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Segments */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Segments
            </CardTitle>
            <CardDescription>
              User activity breakdown (last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Active Users */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">Active Users</p>
                    <p className="text-xs text-muted-foreground">Processed videos recently</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {segments.activeUsers}
                </div>
              </div>

              {/* Inactive Users */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">Inactive Users</p>
                    <p className="text-xs text-muted-foreground">No recent activity (30+ days)</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {segments.inactiveUsers}
                </div>
              </div>

              {/* New User Signups */}
              <div className="p-3 border rounded-lg">
                <div className="pl-8 mb-2">
                  <p className="text-sm font-medium">Signups</p>
                  <p className="text-xs text-muted-foreground">Recent registrations</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold">
                      {metrics.newUsersToday}
                    </div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {metrics.newUsersThisWeek}
                    </div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {metrics.newUsersThisMonth}
                    </div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                </div>
              </div>

              {/* Total Percentage */}
              <div className="pt-4 mt-4 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                  Total: {segments.activeUsers + segments.inactiveUsers} users
                  ({segments.activeUsers + segments.inactiveUsers > 0
                    ? Math.round((segments.activeUsers / (segments.activeUsers + segments.inactiveUsers)) * 100)
                    : 0}% active)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
