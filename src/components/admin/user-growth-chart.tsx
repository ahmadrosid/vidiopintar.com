"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "@/lib/recharts-dynamic";
import { Suspense } from "react";

interface UserGrowthChartProps {
  data: Array<{
    date: string;
    users: number;
  }>;
}

function ChartFallback() {
  return (
    <div className="h-[300px] w-full flex items-center justify-center bg-muted/50 rounded">
      <p className="text-muted-foreground">Loading chart...</p>
    </div>
  );
}

function ChartContent({ data }: UserGrowthChartProps) {
  try {
    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              stroke="var(--border)"
              tick={{ fill: "var(--foreground)", fontSize: 12, opacity: 0.7 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              axisLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              stroke="var(--border)"
              tick={{ fill: "var(--foreground)", fontSize: 12, opacity: 0.7 }}
              axisLine={{ stroke: "var(--border)" }}
            />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              formatter={(value) => [value, "New Users"]}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--foreground)",
              }}
              labelStyle={{
                color: "var(--foreground)",
                fontWeight: 600,
              }}
              itemStyle={{
                color: "var(--foreground)",
              }}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={{ fill: "var(--accent)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "var(--accent)", strokeWidth: 2, fill: "var(--background)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-muted/50 rounded">
        <p className="text-muted-foreground">Chart temporarily unavailable</p>
      </div>
    );
  }
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <ChartContent data={data} />
    </Suspense>
  );
}