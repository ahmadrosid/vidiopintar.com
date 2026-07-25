import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart),
  { ssr: false }
);
export const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false }
);
export const Line = dynamic(
  () => import("recharts").then((m) => m.Line),
  { ssr: false }
);
export const Bar = dynamic(
  () => import("recharts").then((m) => m.Bar),
  { ssr: false }
);
export const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis),
  { ssr: false }
);
export const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis),
  { ssr: false }
);
export const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
export const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false }
);
export const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
export const Legend = dynamic(
  () => import("recharts").then((m) => m.Legend as ComponentType),
  { ssr: false }
);
