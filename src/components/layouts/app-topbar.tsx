"use client";

import { LogOut, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useClerk } from "@clerk/nextjs";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";

interface AppTopbarProps {
  onMenuClick?: () => void;
}

export function AppTopbar({ onMenuClick }: AppTopbarProps) {
  const t = useTranslations("navigation");
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 bg-background/90 px-4 backdrop-blur-md md:px-8">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="relative mr-auto flex h-9 w-full max-w-xs items-center">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="search"
          readOnly
          tabIndex={-1}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="h-9 w-full cursor-default rounded-lg border border-border bg-card px-9 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <LanguageSelector iconOnly />
        <Button
          type="button"
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="cursor-pointer gap-1.5"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">{t("logout")}</span>
        </Button>
      </div>
    </header>
  );
}
