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
    <main className="relative min-h-screen overflow-hidden pt-24">
      <div className="relative z-10 max-w-[1328px] px-6 md:px-8 mx-auto pb-12">
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <Button
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

        <div className="flex flex-col lg:flex-row lg:items-stretch gap-6 lg:gap-8 lg:min-h-[calc(100vh-9rem)]">
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div
            className={cn(
              "fixed lg:sticky lg:top-28 z-50 lg:z-auto",
              "flex flex-col shrink-0",
              "w-[240px]",
              "inset-y-0 left-0 lg:inset-auto",
              "rounded-none lg:rounded-xl",
              "border border-border/50 bg-card",
              "shadow-2xl lg:shadow-sm",
              "p-4",
              "overflow-y-auto",
              "transform transition-transform duration-300 ease-out",
              "lg:self-stretch lg:min-h-[calc(100vh-9rem)]",
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            )}
          >
            <ProfileSidebar onItemClick={() => setIsSidebarOpen(false)} />
          </div>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
