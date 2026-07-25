"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Components } from "react-markdown";
import { useVideoSummary } from "@/hooks/use-video-summary";
import {
  citationSeekSeconds,
  linkifySummaryCitations,
} from "@/lib/summary-citations";
import { cn } from "@/lib/utils";
import { useVideoStore } from "@/stores/video-store";

interface SummarySectionProps {
  videoId: string;
  initialSummary: string;
  allowRegenerate?: boolean;
}

export function SummarySection({
  videoId,
  initialSummary,
  allowRegenerate = true,
}: SummarySectionProps) {
  const t = useTranslations("video.summarySection");
  const tQuiz = useTranslations("quiz");
  const seekAndPlay = useVideoStore((state) => state.seekAndPlay);

  const { summary, isLoading, error, regenerate } = useVideoSummary({
    videoId,
    initialSummary,
  });

  const markdownComponents = useMemo<Partial<Components>>(
    () => ({
      a: ({ href, children, className, ...props }) => {
        const label =
          typeof children === "string"
            ? children
            : Array.isArray(children)
              ? children
                  .map((child) => (typeof child === "string" ? child : ""))
                  .join("")
              : String(children ?? "");

        const seconds = citationSeekSeconds(href, label);
        if (seconds != null) {
          return (
            <button
              type="button"
              className={cn(
                "mx-0.5 inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                className,
              )}
              aria-label={`${tQuiz("seekToMoment")} ${label}`}
              onClick={() => seekAndPlay(seconds)}
            >
              {children}
            </button>
          );
        }

        return (
          <a
            href={href}
            className={className}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    [seekAndPlay, tQuiz],
  );

  const renderedSummary = useMemo(
    () => (summary ? linkifySummaryCitations(summary) : ""),
    [summary],
  );

  const showGenerateButton =
    !summary ||
    summary.trim() === "" ||
    summary.includes("Unable to generate summary") ||
    error;

  const showRegenerateButton =
    allowRegenerate && summary && summary.trim() !== "" && !showGenerateButton;

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  return (
    <div>
      {showGenerateButton ? (
        <div className="text-left py-2">
          <p className="text-muted-foreground mb-4">
            {error
              ? t("generationFailed")
              : !summary
                ? t("notAvailable")
                : t("generationFailed")}
          </p>
          <Button
            onClick={regenerate}
            variant="outline"
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            {error ? t("retry") : t("generate")}
          </Button>
        </div>
      ) : (
        <div className="relative group prose dark:prose-invert prose-sm px-2 max-w-none">
          <Markdown components={markdownComponents}>{renderedSummary}</Markdown>
          <div className="absolute top-0 right-2 flex items-center gap-1 group-hover:visible invisible">
            {showRegenerateButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2"
                onClick={regenerate}
                aria-label={t("regenerate")}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="text-xs">{t("regenerate")}</span>
              </Button>
            )}
            <CopyButton
              content={summary ?? ""}
              copyMessage={t("copied")}
              label={t("copy")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
