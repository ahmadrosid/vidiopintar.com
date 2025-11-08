"use client";

import { cn } from "@/lib/utils";
import { 
  User, 
  MessageSquare, 
  Share2, 
  CreditCard,
  StickyNote
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';

const getSidebarItems = (t: any) => [
  {
    href: "/profile",
    label: t('profileSidebar.profile'),
    icon: User,
  },
  {
    href: "/profile/chat",
    label: t('profileSidebar.chats'),
    icon: MessageSquare,
  },
  {
    href: "/profile/notes",
    label: t('profileSidebar.notes'),
    icon: StickyNote,
  },
  {
    href: "/profile/shared",
    label: t('profileSidebar.shared'),
    icon: Share2,
  },
  {
    href: "/profile/billing",
    label: "Billing",
    icon: CreditCard,
  },
];

interface ProfileSidebarHorizontalProps {
  onItemClick?: () => void;
}

// Horizontal tabs variant
export function ProfileSidebarHorizontal({ onItemClick }: ProfileSidebarHorizontalProps) {
  const pathname = usePathname();
  const t = useTranslations('profile');
  const sidebarItems = getSidebarItems(t);

  return (
    <nav className="flex gap-1 overflow-x-auto -mb-px">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/profile" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

