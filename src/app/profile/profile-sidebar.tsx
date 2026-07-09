"use client";

import { cn } from "@/lib/utils";
import {
  UserIcon,
  ChatCircleIcon,
  NoteIcon,
  ShareNetworkIcon,
  CreditCardIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const getSidebarItems = (t: ReturnType<typeof useTranslations<"profile">>) => [
  {
    href: "/profile",
    label: t("profileSidebar.profile"),
    icon: UserIcon,
  },
  {
    href: "/profile/chat",
    label: t("profileSidebar.chats"),
    icon: ChatCircleIcon,
  },
  {
    href: "/profile/notes",
    label: t("profileSidebar.notes"),
    icon: NoteIcon,
  },
  {
    href: "/profile/shared",
    label: t("profileSidebar.shared"),
    icon: ShareNetworkIcon,
  },
  {
    href: "/profile/billing",
    label: t("profileSidebar.billing"),
    icon: CreditCardIcon,
  },
];

interface ProfileSidebarProps {
  onItemClick?: () => void;
  isCollapsed?: boolean;
}

export function ProfileSidebar({
  onItemClick,
  isCollapsed = false,
}: ProfileSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("profile");
  const sidebarItems = getSidebarItems(t);

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col",
        isCollapsed ? "lg:w-14" : "lg:w-full"
      )}
    >
      {!isCollapsed && (
        <h2 className="text-lg font-semibold mb-4 px-1 lg:hidden">
          {t("profileSidebar.menu")}
        </h2>
      )}
      <nav className="flex flex-col gap-1">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/profile" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                isActive
                  ? "bg-accent/25 text-accent-foreground"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-accent" : "text-zinc-500"
                )}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
