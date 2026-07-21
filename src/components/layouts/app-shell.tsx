"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { AppTopbar } from "@/components/layouts/app-topbar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <div
        className={cn(
          "hidden overflow-hidden transition-[width] duration-300 ease-in-out md:block",
          sidebarCollapsed ? "w-0 pointer-events-none" : "w-64"
        )}
        aria-hidden={sidebarCollapsed}
      >
        <div
          className={cn(
            "h-full w-64 transition-transform duration-300 ease-in-out",
            sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          )}
        >
          <AppSidebar onCollapse={() => setSidebarCollapsed(true)} />
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 z-50 shadow-xl transition-transform"
            )}
          >
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onExpandSidebar={() => setSidebarCollapsed(false)}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
