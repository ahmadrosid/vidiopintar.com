"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs fill-muted-foreground"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [value, "Videos Added"]}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar 
              dataKey="videos" 
              fill="hsl(var(--primary))" 
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