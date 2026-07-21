import { VideoRepository } from "@/lib/db/repository";
import { VideoListWithFilter } from "@/components/video/video-list-with-filter";
import { HomeHero } from "@/components/home/home-hero";
import { getCurrentUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/geo/metadata";

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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-2 md:px-8">
      <HomeHero userId={user.id} />
      <div className="mt-10">
        <VideoListWithFilter videos={videos} />
      </div>
    </div>
  );
}
