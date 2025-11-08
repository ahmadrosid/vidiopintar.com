"use client";

import { ProfileSidebar } from "./profile-sidebar";
import { useState } from "react";
import { Menu, X, ChevronLeft } from "lucide-react";
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

// OPTION 3: Collapsible Sidebar
export function ProfileContentCollapsible({ children }: ProfileContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden pt-24">
      <div className="flex">
        {/* Desktop Sidebar - Collapsible */}
        <aside
          className={cn(
            "hidden lg:block border-r bg-background fixed left-0 top-24 h-[calc(100vh-6rem)] transition-all duration-300 overflow-hidden",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          <div className="p-4 flex items-center justify-between">
            {!isCollapsed && <h2 className="text-sm font-semibold">Menu</h2>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto"
            >
              <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          </div>
          <div className="px-2">
            <ProfileSidebar isCollapsed={isCollapsed} />
          </div>
        </aside>

        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-24 left-0 right-0 z-30 bg-background border-b px-6 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <div className="fixed left-0 top-24 h-[calc(100vh-6rem)] w-64 bg-background z-50 lg:hidden shadow-xl">
            <div className="p-6">
              <ProfileSidebar onItemClick={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className={cn("flex-1 w-full transition-all duration-300", isCollapsed ? "lg:ml-16" : "lg:ml-64")}>
          <div className="max-w-[1328px] mx-auto px-8 py-6 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

