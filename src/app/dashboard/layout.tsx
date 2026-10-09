import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSidebar } from "./dashboard-sidebar";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-site-bg font-mono text-site-text-2 md:flex">
      <DashboardSidebar email={user.email} />
      <main className="min-w-0 flex-1">
        <div className="w-full px-6 py-10 md:px-12 md:py-16">{children}</div>
      </main>
    </div>
  );
}
