"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Language = "en" | "id";

interface LanguageSelectorProps {
  className?: string;
  iconOnly?: boolean;
}

const languageNames = {
  en: "English",
  id: "Bahasa Indonesia",
};

const locales: Language[] = ["en", "id"];

export function LanguageSelector({
  className,
  iconOnly = false,
}: LanguageSelectorProps) {
  const router = useRouter();
  const locale = useLocale();

  const handleLanguageChange = async (newLocale: Language) => {
    if (newLocale === locale) return;

    const languageName = languageNames[newLocale];

    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;

    try {
      await fetch("/api/user/language", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: newLocale }),
      });
    } catch (error) {
      console.log("Failed to sync language preference to backend:", error);
    }

    router.refresh();
    toast.success(`Language changed to ${languageName}`);
  };

  if (iconOnly) {
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Change language"
            className={cn("size-8 shrink-0 p-0", className)}
          >
            <Languages className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onSelect={() => handleLanguageChange(loc)}
              className={cn(locale === loc && "bg-accent")}
            >
              {languageNames[loc]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {languageNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
