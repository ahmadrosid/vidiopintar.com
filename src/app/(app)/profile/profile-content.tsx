"use client";

import { ProfileSidebar } from "./profile-sidebar";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  children?: React.ReactNode;
}

export function ProfileContent({ children }: ProfileContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <h2 className="text-lg font-semibold">Account Settings</h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            aria-label="Close settings menu"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[240px] shrink-0 flex-col overflow-y-auto border border-border/50 bg-card p-4 shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:translate-x-0 lg:rounded-xl lg:shadow-sm",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <ProfileSidebar onItemClick={() => setIsSidebarOpen(false)} />
        </div>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
