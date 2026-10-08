"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  Crown,
  Link2,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoInputSectionProps {
  userId: string;
}

interface UsageStats {
  unlimited: boolean;
  videosUsedToday: number;
  dailyLimit: number;
}

function VideoUsageNotice({ usage, remaining, isAtLimit, isNearLimit }: { usage: UsageStats; remaining: number; isAtLimit: boolean; isNearLimit: boolean }) {
  const usageMessage = isAtLimit
    ? `Daily limit of ${usage.dailyLimit} video${usage.dailyLimit > 1 ? "s" : ""} reached`
    : isNearLimit
      ? `${remaining} video${remaining > 1 ? "s" : ""} remaining today`
      : `${remaining} of ${usage.dailyLimit} daily video${usage.dailyLimit > 1 ? "s" : ""} remaining`;
  return (
    <p className="flex w-full items-center justify-start gap-2 text-sm text-muted-foreground">
      {(isAtLimit || isNearLimit) && <AlertTriangle className="size-4 shrink-0 text-amber-500 dark:text-amber-400" />}
      <span>{usageMessage}{" · "}<Link href="/profile/billing" className="text-accent hover:text-accent/80 hover:underline">Upgrade</Link></span>
    </p>
  );
}

function VideoLimitDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("limitDialog");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><div className="mb-2 flex items-center gap-3"><div className="rounded-full border border-accent/20 bg-accent/10 p-2"><AlertTriangle className="h-5 w-5 text-accent" /></div><DialogTitle>{t("title")}</DialogTitle></div></DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <div className="rounded-lg border border-accent/20 bg-accent/10 p-4"><div className="mb-2 flex items-center gap-2"><Crown className="h-4 w-4 text-accent" /><span className="text-sm font-medium">{t("premiumBenefits")}</span></div><ul className="space-y-1 text-xs text-muted-foreground"><li>• {t("benefits.unlimited")}</li><li>• {t("benefits.ai")}</li><li>• {t("benefits.support")}</li><li>• {t("benefits.features")}</li></ul></div>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-2"><Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">{t("waitTomorrow")}</Button><Link href="/profile/billing" className="flex-1"><Button className="w-full"><Crown className="mr-2 h-4 w-4" />{t("upgradeNow")}</Button></Link></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VideoInputSection({ userId }: VideoInputSectionProps) {
  const router = useRouter();
  const tHero = useTranslations("heroForm");

  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [input, setInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/user/usage-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setUsage(data);
      })
      .catch(() => {
        if (!cancelled) setUsage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setErrors([tHero("videoUrlRequired")]);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch("/api/video/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: input }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const apiErrors = result.errors ?? [result.error ?? "An error occurred"];
        setErrors(apiErrors);
        if (apiErrors.some((msg: string) => msg.includes("daily limit") || msg.includes("upgrade"))) {
          setShowLimitDialog(true);
        }
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();

      if (result.videoId) {
        router.push(`/video/${result.videoId}`);
      } else {
        toast.success("Video submitted successfully!");
        setInput("");
        setIsSubmitting(false);
      }
    } catch {
      setErrors(["Network error. Please try again."]);
      setIsSubmitting(false);
    }
  };

  const remaining = usage ? usage.dailyLimit - usage.videosUsedToday : 0;
  const usagePercent = usage ? (usage.videosUsedToday / usage.dailyLimit) * 100 : 0;
  const isAtLimit = usage ? usage.videosUsedToday >= usage.dailyLimit : false;
  const isNearLimit = usage ? usagePercent >= 80 && !isAtLimit : false;

  return (
    <div className="flex w-full flex-col items-stretch gap-3">
      {usage && !usage.unlimited && <VideoUsageNotice usage={usage} remaining={remaining} isAtLimit={isAtLimit} isNearLimit={isNearLimit} />}

      <form onSubmit={handleSubmit} className="w-full space-y-2">
        {errors.length > 0 && !showLimitDialog && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
            {errors.map((error) => (
              <p key={error} className="text-sm text-destructive">
                {error}
              </p>
            ))}
          </div>
        )}

        <div className="flex w-full items-center gap-3 rounded-lg border border-input bg-background py-2 pl-4 pr-2">
          <Link2 className="size-5 shrink-0 text-accent" />
          <input
            type="text"
            name="videoUrl"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tHero("placeholder")}
            autoComplete="url"
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent text-[1rem] leading-normal text-foreground shadow-none outline-none ring-0 placeholder:text-[1rem] placeholder:text-muted-foreground focus:ring-0 focus-visible:ring-0"
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 cursor-pointer rounded-lg bg-accent px-6 font-medium text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting ? <Loader className="size-4 animate-spin" /> : "Submit"}
          </Button>
        </div>
      </form>

      <VideoLimitDialog open={showLimitDialog} onOpenChange={setShowLimitDialog} />
    </div>
  );
}
