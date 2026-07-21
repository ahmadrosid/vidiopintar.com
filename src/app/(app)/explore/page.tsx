import { RecommendedVideos } from "@/components/video/recommended-videos";
import { buildPageMetadata } from "@/lib/geo/metadata";

export const metadata = buildPageMetadata({
  title: "Explore",
  description: "Explore learning content on Vidiopintar.",
  path: "/explore",
  noIndex: true,
});

export default function ExplorePage() {
  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <RecommendedVideos />
    </div>
  );
}
