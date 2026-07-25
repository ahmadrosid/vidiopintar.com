"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "@/lib/recharts-dynamic";
import { Suspense } from "react";

interface VideoAdditionsChartProps {
  data: Array<{
    date: string;
    videos: number;
  }>;
}

function ChartFallback() {
  return (
    <div className="h-[300px] w-full flex items-center justify-center bg-muted/50 rounded">
      <p className="text-muted-foreground">Loading chart...</p>
    </div>
  );
}

function ChartContent({ data }: VideoAdditionsChartProps) {
  try {
    return (
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
              formatter={(value) => [value, "Videos Added"]}
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
            <Bar
              dataKey="videos"
              fill="var(--accent)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
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

export function VideoAdditionsChart({ data }: VideoAdditionsChartProps) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <ChartContent data={data} />
    </Suspense>
  );
}