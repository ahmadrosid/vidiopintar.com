import { notFound } from "next/navigation";
import { ExploreChannelVideosContent } from "@/components/explore/explore-channel-videos-content";
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

export default async function ExploreChannelPage({
  params,
}: ExploreChannelPageProps) {
  const { channelId } = await params;
  const channel = await getChannelById(channelId);
  if (!channel) notFound();

  const videos = await getLatestVideosForChannel(channel.channelId, 10);

  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ExploreChannelVideosContent channel={channel} videos={videos} />
    </div>
  );
}
