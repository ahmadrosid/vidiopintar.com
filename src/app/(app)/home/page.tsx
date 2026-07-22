import { VideoRepository } from "@/lib/db/repository";
import { VideoListWithFilter } from "@/components/video/video-list-with-filter";
import { HomeHero } from "@/components/home/home-hero";
import { getCurrentUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { getRecommendedVideosForUser } from "@/lib/recommendations/get-recommended-videos";

export const metadata = buildPageMetadata({
  title: "Dashboard",
  description:
    "Your AI YouTube learning dashboard — summarize videos, chat with content, and organize knowledge.",
  path: "/home",
  noIndex: true,
});

export default async function Home() {
  const user = await getCurrentUser();
  const videos = await VideoRepository.getAllForUserWithDetails(user.id);
  const recommendedVideos =
    videos.length === 0
      ? await getRecommendedVideosForUser(user.id)
      : undefined;

  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <HomeHero userId={user.id} />
      <VideoListWithFilter
        videos={videos}
        recommendedVideos={recommendedVideos}
      />
    </div>
  );
}
