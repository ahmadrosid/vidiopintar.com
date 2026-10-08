"use client";

import { useTranslations } from "next-intl";
import { ExploreBackHeader } from "@/components/explore/explore-back-header";
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
      <ExploreBackHeader title={t("channels")} count={t("channelCount", { count: channels.length })} backLabel={t("backToExplore")} />

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
