"use client";

import { cn } from "@/lib/utils";
import { 
  User, 
  Settings, 
  MessageSquare, 
  Share2, 
  Palette, 
  Bell,
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

interface ProfileSidebarProps {
  onItemClick?: () => void;
}

export function ProfileSidebar({ onItemClick }: ProfileSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('profile');
  const sidebarItems = getSidebarItems(t);

  return (
    <aside className="w-full lg:w-64 p-4 lg:p-0 lg:pr-8">
      <h2 className="text-lg font-semibold mb-4 px-3 lg:hidden">{t('profileSidebar.menu')}</h2>
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/profile" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}