"use client"

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface AdminNavigationProps {
  title: string;
  description: string;
}

const navigationItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/cost", label: "Cost" },
  { href: "/admin/feedback", label: "Feedback" },
];

export function AdminNavigation({ title, description }: AdminNavigationProps) {
  const pathname = usePathname();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>

      <div className="flex pt-4 px-1">
        {navigationItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "link", className: "px-0 pr-4" }),
              pathname === item.href && "text-primary"
            )}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}