"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TokenUsageChart } from "./token-usage-chart";
import { TopUsers } from "./top-users";
import { Filter, DollarSign, Zap, Activity } from "lucide-react";

interface TopUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  messageCount: number;
  videoCount: number;
  lastActivity: Date | null;
  totalTokens: number;
}

interface TokenUsageOverviewProps {
  tokenUsageData: {
    "7d": Array<{ date: string; totalTokens: number; totalCost: string; requests: number }>;
    "1m": Array<{ date: string; totalTokens: number; totalCost: string; requests: number }>;
    "3m": Array<{ date: string; totalTokens: number; totalCost: string; requests: number }>;
  };
  modelUsage: Array<{
    model: string;
    provider: string;
    totalTokens: number;
    totalCost: string;
    requests: number;
  }>;
  operationUsage: Array<{
    operation: string;
    totalTokens: number;
    totalCost: string;
    requests: number;
  }>;
  topUsers: TopUser[];
}

function getPeriodLabel(period: "7d" | "1m" | "3m") {
  switch (period) {
    case "7d": return "7 Days";
    case "1m": return "1 Month";
    case "3m": return "3 Months";
  }
}

export function TokenUsageOverview({ tokenUsageData, modelUsage, operationUsage, topUsers }: TokenUsageOverviewProps) {
  const [period, setPeriod] = useState<"7d" | "1m" | "3m">("7d");

  const totalCostByModel = modelUsage.reduce((acc, model) => acc + parseFloat(model.totalCost), 0);
  const totalTokensByModel = modelUsage.reduce((acc, model) => acc + model.totalTokens, 0);

  return (
    <div className="space-y-6">
      {/* Model and Operation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Usage */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Usage by Model
            </CardTitle>
            <CardDescription>
              Token usage and costs broken down by AI model
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modelUsage.map((model) => (
                <div key={`${model.provider}-${model.model}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium">{model.model}</div>
                    <div className="text-sm text-muted-foreground">{model.provider}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${parseFloat(model.totalCost).toFixed(4)}</div>
                    <div className="text-sm text-muted-foreground">
                      {model.totalTokens.toLocaleString()} tokens
                    </div>
                  </div>
                </div>
              ))}
              {modelUsage.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No token usage data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operation Usage */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Usage by Operation
            </CardTitle>
            <CardDescription>
              Token usage and costs broken down by operation type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operationUsage.map((operation) => (
                <div key={operation.operation} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium capitalize">{operation.operation.replace('_', ' ')}</div>
                    <div className="text-sm text-muted-foreground">{operation.requests} requests</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${parseFloat(operation.totalCost).toFixed(4)}</div>
                    <div className="text-sm text-muted-foreground">
                      {operation.totalTokens.toLocaleString()} tokens
                    </div>
                  </div>
                </div>
              ))}
              {operationUsage.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No operation usage data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token Usage Chart and Top Users */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Token Usage Over Time</CardTitle>
            <CardDescription>
              Token consumption, costs, and request patterns
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md hover:bg-accent text-sm border border-border">
              <Filter className="size-4" />
              {getPeriodLabel(period)}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPeriod("7d")}>
                7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("1m")}>
                1 Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPeriod("3m")}>
                3 Months
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <TokenUsageChart data={tokenUsageData[period]} />
        </CardContent>
      </Card>
    </div>
  );
}