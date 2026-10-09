"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
const STORAGE_KEY = "theme";

// Flips the `dark` class on <html> and saves the choice; until the user picks, the OS setting applies.
export function ThemeToggle({ label, className = "" }: { label?: string; className?: string }) {
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Private windows can block storage; the theme still changes for this page view.
    }
  };

  return (
    <button type="button" onClick={toggle} aria-label="Ganti tema terang dan gelap" className={`cursor-pointer ${className}`}>
      <HugeiconsIcon icon={Sun01Icon} className="hidden size-[18px] shrink-0 dark:block" />
      <HugeiconsIcon icon={Moon01Icon} className="size-[18px] shrink-0 dark:hidden" />
      {label}
    </button>
  );
}
