"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  House,
  Compass,
  Books,
  Note,
  ClockCounterClockwise,
  CaretDown,
} from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

const navItems = [
  { href: "/home", key: "home" as const, icon: House },
  { href: "/explore", key: "explore" as const, icon: Compass },
  { href: "/library", key: "library" as const, icon: Books },
  { href: "/notes", key: "notes" as const, icon: Note },
  { href: "/history", key: "history" as const, icon: ClockCounterClockwise },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { data: session } = useSession();
  const user = session?.user;
  const isProfileActive = pathname === "/profile" || pathname?.startsWith("/profile/");

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center px-5">
        <Link href="/home" onClick={onNavigate} className="text-foreground">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon
                weight={isActive ? "fill" : "regular"}
                className={cn(
                  "size-[18px] shrink-0",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}
              />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/profile"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
            isProfileActive
              ? "bg-accent/15 text-accent"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          )}
        >
          <Avatar className="size-8">
            <AvatarImage src={user?.image} alt={user?.name || "Profile"} />
            <AvatarFallback className="bg-accent/20 text-xs text-accent">
              {(user?.name || "P").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 truncate">{t("profile")}</span>
          <CaretDown className="size-4 shrink-0 opacity-60" />
        </Link>
      </div>
    </aside>
  );
}
