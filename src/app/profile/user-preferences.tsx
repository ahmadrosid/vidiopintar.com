"use client";

import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Globe, Moon } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function UserPreferences() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("profile");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <section className="space-y-4">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-36 bg-muted rounded-xl animate-pulse" />
          <div className="h-36 bg-muted rounded-xl animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{t("preferences")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">{t("selectLanguage")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("languageDesc")}
              </p>
            </div>
          </div>
          <LanguageSelector className="w-full" />
        </div>

        <div className="rounded-xl border bg-card p-4 md:p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Moon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">{t("selectTheme")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("themeDesc")}
              </p>
            </div>
          </div>
          <Select
            value={theme}
            onValueChange={(value: Theme) => setTheme(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectThemePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">{t("light")}</SelectItem>
              <SelectItem value="dark">{t("dark")}</SelectItem>
              <SelectItem value="system">{t("system")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t("preferencesNote")}</p>
    </section>
  );
}
