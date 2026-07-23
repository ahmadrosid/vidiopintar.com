"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { isForcedDarkPath } from "@/lib/theme-routes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const forcedTheme = isForcedDarkPath(pathname) ? "dark" : undefined;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="vidiopintar-theme"
      forcedTheme={forcedTheme}
    >
      {children}
    </NextThemesProvider>
  );
}
