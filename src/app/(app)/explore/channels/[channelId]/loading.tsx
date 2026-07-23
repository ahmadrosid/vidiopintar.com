import { ExploreChannelVideosSkeleton } from "@/components/explore/explore-channel-videos-skeleton";

export default function ExploreChannelLoading() {
  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ExploreChannelVideosSkeleton />
    </div>
  );
}
