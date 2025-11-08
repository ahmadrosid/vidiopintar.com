"use client";

import { ProfileSidebar } from "./profile-sidebar";
import { ProfileSidebarHorizontal } from "./profile-sidebar-horizontal";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  children?: React.ReactNode;
}

// OPTION 1: Top Navigation Tabs (Horizontal)
export function ProfileContentTabs({ children }: ProfileContentProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden pt-24">
      <div className="relative z-10 max-w-[1328px] px-8 mx-auto">
        {/* Mobile menu button */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed right-0 top-24 h-[calc(100vh-6rem)] w-64 bg-background z-50 lg:hidden shadow-xl">
            <ProfileSidebar onItemClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* Desktop: Horizontal Tabs */}
        <div className="hidden lg:block border-b mb-6">
          <ProfileSidebarHorizontal />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </main>
  );
}

