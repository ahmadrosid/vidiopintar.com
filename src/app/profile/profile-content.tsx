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

export function ProfileContent({ children }: ProfileContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden pt-24">
      <div className="relative z-10 max-w-[1328px] px-8 mx-auto">
        {/* Mobile menu button */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row relative gap-6">
          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            fixed lg:sticky top-0 lg:top-24 right-0 lg:right-auto h-screen lg:h-auto
            bg-background lg:bg-transparent
            w-64 lg:w-auto
            z-50 lg:z-auto
            transform transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            overflow-y-auto lg:overflow-visible
            pt-24 lg:pt-0
            shadow-xl lg:shadow-none
          `}>
            <ProfileSidebar onItemClick={() => setIsSidebarOpen(false)} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}