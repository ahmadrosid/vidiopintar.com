"use client";

import { ProfileSidebar } from "./profile-sidebar";
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

// OPTION 2: Full-Width Split Layout
export function ProfileContentFullWidth({ children }: ProfileContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden pt-24">
      <div className="flex">
        {/* Desktop Sidebar - Full Height */}
        <aside className="hidden lg:block w-64 border-r fixed left-0 top-24 h-[calc(100vh-6rem)] bg-background overflow-y-auto">
          <div className="p-6">
            <ProfileSidebar />
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
        <div className="flex-1 w-full lg:ml-64">
          <div className="max-w-[1328px] mx-auto px-8 py-6 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

