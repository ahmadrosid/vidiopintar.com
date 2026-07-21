"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  House,
  Books,
  Note,
  ClockCounterClockwise,
  ShareNetwork,
  CreditCard,
} from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

const navItems = [
  { href: "/home", key: "home" as const, icon: House },
  // Explore hidden from sidebar for now — page still available at /explore
  { href: "/library", key: "library" as const, icon: Books },
  { href: "/notes", key: "notes" as const, icon: Note },
  { href: "/profile/chat", key: "chats" as const, icon: ClockCounterClockwise },
  { href: "/profile/shared", key: "shared" as const, icon: ShareNetwork },
  { href: "/profile/billing", key: "billing" as const, icon: CreditCard },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

function isNavActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/profile") {
    return pathname === "/profile";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { data: session } = useSession();
  const user = session?.user;
  const isProfileActive = pathname === "/profile";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center px-5">
        <Link href="/home" onClick={onNavigate} className="text-foreground">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <item.icon
                weight={isActive ? "fill" : "regular"}
                className={cn(
                  "size-[18px] shrink-0",
                  isActive ? "text-foreground" : "text-muted-foreground"
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
              ? "bg-sidebar-accent text-foreground"
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
        </Link>
      </div>
    </aside>
  );
}
