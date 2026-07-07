"use client";

import { VideoSubmitForm } from "@/components/video/video-submit-form";
import { PlanUsageNotification } from "@/components/video/plan-usage-notification";

interface VideoInputSectionProps {
  userId?: string;
}

export function VideoInputSection({ userId }: VideoInputSectionProps) {
  return (
    <div className="w-full space-y-6">
      <PlanUsageNotification userId={userId} />
      <VideoSubmitForm />
    </div>
  );
}
