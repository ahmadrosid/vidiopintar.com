"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { RetentionCohort } from "@/types/admin";

interface RetentionCohortChartProps {
  data: RetentionCohort[];
}

export function RetentionCohortChart({ data }: RetentionCohortChartProps) {
  const chartData = data.map(cohort => ({
    period: cohort.cohortPeriod,
    "Day 1": cohort.day1Percentage,
    "Day 3": cohort.day3Percentage,
    "Day 5": cohort.day5Percentage,
    "Day 7": cohort.day7Percentage,
    totalUsers: cohort.totalUsers,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const totalUsers = payload[0]?.payload?.totalUsers;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Cohort Week
                        </span>
                        <span className="font-bold">
                          {label}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Total Users
                        </span>
                        <span className="font-bold">
                          {totalUsers?.toLocaleString()}
                        </span>
                      </div>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            {entry.dataKey}
                          </span>
                          <span 
                            className="font-bold" 
                            style={{ color: entry.color }}
                          >
                            {entry.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Day 1"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Day 3"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Day 5"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Day 7"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}