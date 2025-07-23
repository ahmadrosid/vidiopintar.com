"use client";

import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { LanguageSelector } from "@/components/language-selector";

type Theme = "light" | "dark" | "system";

interface UserPreferencesProps {
  defaultLanguage?: 'en' | 'id';
}

export function UserPreferences({ defaultLanguage }: UserPreferencesProps) {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <Card className="p-6 shadow-none">
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-10 w-[200px] bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded my-4" />
            <div className="h-10 w-[200px] bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 shadow-none">
        <h3 className="text-lg font-semibold mb-4">Preferences</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm md:text-base mb-3">Select Language</h4>
            <LanguageSelector className="w-full" />
          </div>
          <div>
            <h4 className="text-sm md:text-base mb-3">Select Theme</h4>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-xs md:text-sm text-gray-500 mt-6">
          <p>Your preferences are saved locally and will persist across sessions.</p>
        </div>
      </Card>
    </div>
  );
}
