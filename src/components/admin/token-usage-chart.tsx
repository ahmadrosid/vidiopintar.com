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

interface TokenUsageChartProps {
  data: Array<{
    date: string;
    totalTokens: number;
    totalCost: string;
    requests: number;
  }>;
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    tokens: item.totalTokens,
    cost: parseFloat(item.totalCost),
    requests: item.requests,
  }));

  return (
    <div className="space-y-4">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Date
                          </span>
                          <span className="font-bold">
                            {label}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Tokens
                          </span>
                          <span className="font-bold text-blue-600">
                            {payload[0].value?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Cost
                          </span>
                          <span className="font-bold text-green-600">
                            ${payload[1].value?.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Requests
                          </span>
                          <span className="font-bold text-purple-600">
                            {payload[2].value}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              yAxisId="cost"
            />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              yAxisId="requests"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}