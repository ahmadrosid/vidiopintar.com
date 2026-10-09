"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "theme";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

const OPTIONS = [
  { value: "system", label: "Sistem", icon: ComputerIcon },
  { value: "light", label: "Terang", icon: Sun01Icon },
  { value: "dark", label: "Gelap", icon: Moon01Icon },
] as const;

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "light" || stored === "dark") return stored;
  } catch {}

  return "system";
}

function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const change = (next: Theme) => {
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {}

    applyTheme(next);
    setTheme(next);
  };

  return (
    <div className={className}>
      <Select
        value={theme}
        onValueChange={(value) => {
          const next = OPTIONS.find((option) => option.value === value);

          if (next) change(next.value);
        }}
      >
        <SelectTrigger
          aria-label="Tema"
          className={`min-w-36 cursor-pointer rounded-md border-site-line bg-site-panel px-3 text-sm text-site-text shadow-none dark:shadow-sm ${focusRing}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-md border-site-line bg-site-header text-site-text shadow-none">
          {OPTIONS.map(({ value, label, icon }) => (
            <SelectItem
              key={value}
              value={value}
              className={`cursor-pointer gap-2 rounded-sm text-site-text-2 focus:bg-site-accent-soft focus:text-site-text ${focusRing}`}
            >
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={icon} className="size-4 shrink-0" />
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
