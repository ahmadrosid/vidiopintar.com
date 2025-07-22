"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs fill-muted-foreground"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [value, "New Users"]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--background))" }}
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