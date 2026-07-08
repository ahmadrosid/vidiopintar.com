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

export function VideoInputSection({ userId }: VideoInputSectionProps) {
  const router = useRouter();
  const tHero = useTranslations("heroForm");
  const tLimit = useTranslations("limitDialog");

  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [input, setInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  useEffect(() => {
    fetch("/api/user/usage-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then(setUsage)
      .catch(() => setUsage(null));
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
      const result = await response.json();

      if (!response.ok) {
        const apiErrors = result.errors ?? [result.error ?? "An error occurred"];
        setErrors(apiErrors);
        if (apiErrors.some((msg: string) => msg.includes("daily limit") || msg.includes("upgrade"))) {
          setShowLimitDialog(true);
        }
        setIsSubmitting(false);
        return;
      }

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

  const usageMessage = isAtLimit
    ? `Daily limit of ${usage?.dailyLimit} video${usage && usage.dailyLimit > 1 ? "s" : ""} reached`
    : isNearLimit
      ? `${remaining} video${remaining > 1 ? "s" : ""} remaining today`
      : `${remaining} of ${usage?.dailyLimit} daily video${usage && usage.dailyLimit > 1 ? "s" : ""} remaining`;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {usage && !usage.unlimited && (
        <div
          className={`flex w-full max-w-md items-center justify-between gap-4 rounded-full px-5 py-2.5 ${
            isAtLimit || isNearLimit
              ? "bg-amber-50 dark:bg-amber-950/30"
              : "bg-blue-50 dark:bg-accent/10"
          }`}
        >
          <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-muted-foreground">
            {(isAtLimit || isNearLimit) && (
              <AlertTriangle className="size-4 shrink-0 text-amber-500" />
            )}
            {usageMessage}
          </span>
          <Link href="/profile/billing">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto shrink-0 px-0 py-0 font-medium text-accent hover:bg-transparent hover:text-accent/80"
            >
              <Crown className="size-4" />
              Upgrade
            </Button>
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-2">
        {errors.length > 0 && !showLimitDialog && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            {errors.map((error) => (
              <p key={error} className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            ))}
          </div>
        )}

        <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 pl-3 py-2 shadow-sm [--input-bg:white] dark:border-border dark:bg-card dark:[--input-bg:var(--card)]">
          <Link2 className="size-5 shrink-0 text-accent" />
          <input
            type="text"
            name="videoUrl"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tHero("placeholder")}
            autoComplete="url"
            className="min-w-0 flex-1 appearance-none border-0 !bg-transparent text-[1rem] leading-normal text-foreground shadow-none outline-none ring-0 placeholder:text-[1rem] placeholder:text-slate-400 focus:ring-0 focus-visible:ring-0 [&:-webkit-autofill]:text-[1rem] [&:-webkit-autofill::first-line]:text-[1rem] [&:-webkit-autofill]:[-webkit-text-fill-color:inherit] [&:-webkit-autofill]:[transition:background-color_9999s_ease-out_0s] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_var(--input-bg)]"
            required
          />
          <Button type="submit" disabled={isSubmitting} className="shrink-0 cursor-pointer rounded-md px-5">
            {isSubmitting ? <Loader className="size-4 animate-spin" /> : "Submit"}
          </Button>
        </div>
      </form>

      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-full border border-accent/20 bg-accent/10 p-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
              </div>
              <DialogTitle>{tLimit("title")}</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{tLimit("description")}</p>
            <div className="rounded-lg border border-accent/20 bg-accent/10 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">{tLimit("premiumBenefits")}</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• {tLimit("benefits.unlimited")}</li>
                <li>• {tLimit("benefits.ai")}</li>
                <li>• {tLimit("benefits.support")}</li>
                <li>• {tLimit("benefits.features")}</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setShowLimitDialog(false)} className="flex-1">
              {tLimit("waitTomorrow")}
            </Button>
            <Link href="/profile/billing" className="flex-1">
              <Button className="w-full">
                <Crown className="mr-2 h-4 w-4" />
                {tLimit("upgradeNow")}
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
