"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserPlus, TrendingUp } from "lucide-react";
import { RetentionMetrics } from "@/types/admin";

interface RetentionMetricsCardsProps {
  metrics: RetentionMetrics;
}

export function RetentionMetricsCards({ metrics }: RetentionMetricsCardsProps) {
  const cards = [
    {
      title: "Monthly Active Users",
      value: metrics.mau,
      description: "Users who processed videos in last 30 days",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Weekly Active Users", 
      value: metrics.wau,
      description: "Users who processed videos in last 7 days",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "New Users This Month",
      value: metrics.newUsersThisMonth,
      description: "Fresh signups this month",
      icon: UserPlus,
      color: "text-purple-600",
    },
    {
      title: "User Stickiness",
      value: `${metrics.stickinessRatio}%`,
      description: "WAU/MAU ratio percentage",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}