"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { AppTopbar } from "@/components/layouts/app-topbar";
import { CommandPalette } from "@/components/search/command-palette";
import { cn } from "@/lib/utils";

const mobileSidebarTransition = {
  type: "tween" as const,
  duration: 0.28,
  ease: [0.32, 0.72, 0, 1] as const,
};

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const handleSearchOpenChange = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      queueMicrotask(() => searchButtonRef.current?.focus());
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isShortcut) return;

      if (searchOpen) {
        event.preventDefault();
        handleSearchOpenChange(false);
        return;
      }

      if (isEditableTarget(event.target)) return;

      event.preventDefault();
      setSearchOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

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

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              key="mobile-backdrop"
              type="button"
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="mobile-sidebar"
              className="fixed inset-y-0 left-0 z-50 shadow-xl md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={mobileSidebarTransition}
            >
              <AppSidebar onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          ref={searchButtonRef}
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onExpandSidebar={() => setSidebarCollapsed(false)}
          onOpenSearch={() => setSearchOpen(true)}
          searchOpen={searchOpen}
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <CommandPalette open={searchOpen} onOpenChange={handleSearchOpenChange} />
    </div>
  );
}
