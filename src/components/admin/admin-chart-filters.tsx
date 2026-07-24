"use client";

import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserGrowthChart } from "@/components/admin/user-growth-chart";
import { VideoAdditionsChart } from "@/components/admin/video-additions-chart";
import { Filter } from "lucide-react";

interface AdminChartsProps {
  userGrowthData: {
    "7d": any;
    "1m": any;
    "3m": any;
  };
  videoAdditionsData: {
    "7d": any;
    "1m": any;
    "3m": any;
  };
}

function getPeriodLabel(period: "7d" | "1m" | "3m") {
  switch (period) {
    case "7d": return "7 Days";
    case "1m": return "1 Month";
    case "3m": return "3 Months";
  }
}

export function AdminChartFilters({ userGrowthData, videoAdditionsData }: AdminChartsProps) {
  const [userGrowthPeriod, setUserGrowthPeriod] = useState<"7d" | "1m" | "3m">("7d");
  const [videoAdditionsPeriod, setVideoAdditionsPeriod] = useState<"7d" | "1m" | "3m">("7d");

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      {/* User Growth Chart */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              New user registrations over time
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-accent text-sm border border-border bg-background text-foreground">
              <Filter className="h-4 w-4" />
              {getPeriodLabel(userGrowthPeriod)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setUserGrowthPeriod("7d")}>
                7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUserGrowthPeriod("1m")}>
                1 Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUserGrowthPeriod("3m")}>
                3 Months
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <UserGrowthChart data={userGrowthData[userGrowthPeriod]} />
        </CardContent>
      </Card>

      {/* Video Additions Chart */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Video Additions</CardTitle>
            <CardDescription>
              Daily video additions to the platform
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-accent text-sm border border-border bg-background text-foreground">
              <Filter className="h-4 w-4" />
              {getPeriodLabel(videoAdditionsPeriod)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setVideoAdditionsPeriod("7d")}>
                7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVideoAdditionsPeriod("1m")}>
                1 Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setVideoAdditionsPeriod("3m")}>
                3 Months
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <VideoAdditionsChart data={videoAdditionsData[videoAdditionsPeriod]} />
        </CardContent>
      </Card>
    </div>
  );
}