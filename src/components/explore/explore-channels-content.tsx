"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

function formatSubscriberCount(count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (count >= 1_000) {
    const value = count / 1_000;
    return `${value >= 10 ? Math.round(value) : value.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(count);
}

type ExploreChannelsContentProps = {
  channels: YoutubeSearchChannel[];
};

export function ExploreChannelsContent({
  channels,
}: ExploreChannelsContentProps) {
  const t = useTranslations("explore");

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("backToExplore")}
        </Link>

        <header className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {t("channels")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("channelCount", { count: channels.length })}
          </p>
        </header>
      </div>

      {channels.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">{t("emptyChannels")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Link
              key={channel.channelId}
              href={`/explore/channels/${channel.channelId}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-card p-3 transition-colors hover:border-white/20 hover:bg-card/80"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                {channel.thumbnailUrl ? (
                  // Channel avatars are hosted on ggpht CDN domains not in next/image config.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={channel.thumbnailUrl}
                    alt={channel.title}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {channel.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {t("subscriberCount", {
                    count: formatSubscriberCount(channel.subscriberCount),
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
