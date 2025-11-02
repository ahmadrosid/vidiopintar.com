"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VideoSubmitForm } from "@/components/video/video-submit-form";
import { VideoSearchForm } from "@/components/video/video-search-form";
import { PlanUsageNotification } from "@/components/video/plan-usage-notification";
import { useLocalStorage, useIsClient } from "usehooks-ts";
import { useTranslations } from "next-intl";

interface VideoInputSectionProps {
  userId?: string;
}

export function VideoInputSection({ userId }: VideoInputSectionProps) {
  const [isSearchMode, setIsSearchMode] = useLocalStorage(
    "vidiopintar-switch-mode-key",
    false
  );
  const isClient = useIsClient();
  const t = useTranslations("video");

  // Always render default state during SSR and initial hydration
  const effectiveSearchMode = isClient ? isSearchMode : false;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!effectiveSearchMode && <PlanUsageNotification userId={userId} />}
      {!effectiveSearchMode ? <VideoSubmitForm /> : <VideoSearchForm />}
      <div className="flex items-center justify-center space-x-3">
        <Label
          htmlFor="mode-switch"
          className={
            !effectiveSearchMode
              ? "font-semibold text-[#00D4DD] cursor-pointer"
              : "text-muted-foreground cursor-pointer"
          }
        >
          {t("submitUrl")}
        </Label>
        <Switch
          id="mode-switch"
          checked={effectiveSearchMode}
          onCheckedChange={setIsSearchMode}
          className="cursor-pointer"
        />
        <Label
          htmlFor="mode-switch"
          className={
            effectiveSearchMode
              ? "font-semibold text-[#00D4DD] cursor-pointer"
              : "text-muted-foreground cursor-pointer"
          }
        >
          {t("searchVideos")}
        </Label>
      </div>
    </div>
  );
}
