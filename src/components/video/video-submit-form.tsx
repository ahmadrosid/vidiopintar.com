"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader, AlertTriangle, Crown } from "lucide-react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

export function VideoSubmitForm() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const tHero = useTranslations("heroForm");
  const t = useTranslations("limitDialog");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) {
      setErrors(["Video URL is required"]);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch("/api/video/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl: input }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setErrors(result.errors);

          // Check if it's a plan limit error
          const hasLimitError = result.errors.some(
            (error: string) =>
              error.includes("daily limit") || error.includes("upgrade")
          );

          if (hasLimitError) {
            setShowLimitDialog(true);
          }
        } else {
          setErrors([result.error || "An error occurred"]);
        }
        return;
      }

      // Success - redirect to video page
      if (result.videoId) {
        // Use Next.js router for smooth client-side navigation
        router.push(`/video/${result.videoId}`);
        // Keep loading state active during navigation
        // Don't set isSubmitting to false here - let it show until page loads
      } else {
        toast.success("Video submitted successfully!");
        setInput("");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      setErrors(["Network error. Please try again."]);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.length > 0 && !showLimitDialog && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="text-sm text-red-800 dark:text-red-200">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <PromptInput value={input} onValueChange={(value) => setInput(value)}>
          <PromptInputTextarea
            name="videoUrl"
            placeholder={tHero("placeholder")}
            className="bg-transparent!"
            required
          />
          <PromptInputActions className="justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl cursor-pointer text-black shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </PromptInputActions>
        </PromptInput>
      </form>

      {/* Plan Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#00D4DD]/10 dark:bg-[#00D4DD]/20 rounded-full border border-[#00D4DD]/20">
                <AlertTriangle className="h-5 w-5 text-[#00D4DD]" />
              </div>
              <DialogTitle>{t("title")}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("description")}</p>

            <div className="bg-gradient-to-r from-[#00D4DD]/10 to-purple-50 dark:from-[#00D4DD]/10 dark:to-purple-900/20 p-4 rounded-lg border border-[#00D4DD]/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-[#00D4DD]" />
                <span className="font-medium text-sm">
                  {t("premiumBenefits")}
                </span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {t("benefits.unlimited")}</li>
                <li>• {t("benefits.ai")}</li>
                <li>• {t("benefits.support")}</li>
                <li>• {t("benefits.features")}</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLimitDialog(false)}
              className="flex-1"
            >
              {t("waitTomorrow")}
            </Button>
            <Link href="/profile/billing" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-[#00D4DD] to-[#6155F5] hover:from-[#00AAB6] hover:to-[#5043D4] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                <Crown className="w-4 h-4 mr-2" />
                {t("upgradeNow")}
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
