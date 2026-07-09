"use client";

import { useState } from "react";
import { ChevronRight, MessageCircle } from "lucide-react";
import { FeedbackModal } from "@/components/feedback/feedback-modal";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function ProfileFeedback() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = useTranslations("profile");

  const handleFeedbackSubmit = async (
    rating: "bad" | "decent" | "love_it",
    comment?: string
  ) => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "platform",
          rating,
          comment,
          metadata: {
            page: "profile",
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success(t("feedbackSuccess"));
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full rounded-xl border bg-card p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left transition-colors hover:bg-muted/30"
      >
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{t("helpUsImprove")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("helpUsImproveDesc")}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground shrink-0">
          <MessageCircle className="h-4 w-4" />
          {t("giveFeedback")}
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}
