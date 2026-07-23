import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExploreChannelVideosContent } from "@/components/explore/explore-channel-videos-content";
import { ExploreChannelVideosSkeleton } from "@/components/explore/explore-channel-videos-skeleton";
import { buildPageMetadata } from "@/lib/geo/metadata";
import {
  getChannelById,
  getLatestVideosForChannel,
} from "@/lib/youtube/channel-videos";

type ExploreChannelPageProps = {
  params: Promise<{ channelId: string }>;
};

export async function generateMetadata({ params }: ExploreChannelPageProps) {
  const { channelId } = await params;
  const channel = await getChannelById(channelId);

  return buildPageMetadata({
    title: channel?.title ?? "Channel",
    description: channel
      ? `Latest videos from ${channel.title} on Vidiopintar.`
      : "Browse channel videos on Vidiopintar.",
    path: `/explore/channels/${channelId}`,
    noIndex: true,
  });
}

async function ExploreChannelVideosLoader({
  params,
}: ExploreChannelPageProps) {
  const { channelId } = await params;
  const channel = await getChannelById(channelId);
  if (!channel) notFound();

  const videos = await getLatestVideosForChannel(channel.channelId, 10);

  return <ExploreChannelVideosContent channel={channel} videos={videos} />;
}

export default function ExploreChannelPage({
  params,
}: ExploreChannelPageProps) {
  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <Suspense fallback={<ExploreChannelVideosSkeleton />}>
        <ExploreChannelVideosLoader params={params} />
      </Suspense>
    </div>
  );
}
