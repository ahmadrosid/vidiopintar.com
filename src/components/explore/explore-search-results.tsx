import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { VideoCard } from "@/components/video/video-card";
import { ChannelResultCard } from "@/components/explore/channel-result-card";
import { formatSubscriberCount } from "@/components/explore/format-subscriber-count";
import type { RecommendedVideo } from "@/lib/recommended-videos";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

type ExploreSearchResultsProps = {
  loading: boolean;
  error: string | null;
  videos: RecommendedVideo[];
  channels: YoutubeSearchChannel[];
  labels: {
    searching: string;
    emptySearch: string;
    searchVideos: string;
    emptySearchVideos: string;
    searchChannels: string;
    emptySearchChannels: string;
    subscriberCount: (count: string) => string;
  };
};

export function ExploreSearchResults({
  loading,
  error,
  videos,
  channels,
  labels,
}: ExploreSearchResultsProps) {
  if (loading) {
    return (
      <LoadingSpinner
        text={labels.searching}
        className="py-6 text-sm text-muted-foreground"
      />
    );
  }

  if (error) {
    return <p className="py-6 text-sm text-muted-foreground">{error}</p>;
  }

  if (videos.length === 0 && channels.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">{labels.emptySearch}</p>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
          {labels.searchVideos}
        </h2>
        {videos.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            {labels.emptySearchVideos}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard
                key={video.youtubeId}
                youtubeId={video.youtubeId}
                title={video.title}
                channelTitle={video.channelTitle}
                thumbnailUrl={video.thumbnailUrl}
                duration={video.duration}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">
          {labels.searchChannels}
        </h2>
        {channels.length === 0 ? (
          <p className="py-6 text-sm text-muted-foreground">
            {labels.emptySearchChannels}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <ChannelResultCard
                key={channel.channelId}
                channel={channel}
                subscriberLabel={labels.subscriberCount(
                  formatSubscriberCount(channel.subscriberCount),
                )}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
