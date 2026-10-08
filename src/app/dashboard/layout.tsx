import type { Metadata } from "next";
import { SitePage } from "@/components/site/site-page";
import { DashboardNav } from "./dashboard-nav";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <SitePage nav={<DashboardNav />}>{children}</SitePage>;
}
