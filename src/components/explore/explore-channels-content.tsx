"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { ChannelResultCard } from "@/components/explore/channel-result-card";
import { formatSubscriberCount } from "@/components/explore/format-subscriber-count";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

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
            <ChannelResultCard
              key={channel.channelId}
              channel={channel}
              subscriberLabel={t("subscriberCount", {
                count: formatSubscriberCount(channel.subscriberCount),
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
