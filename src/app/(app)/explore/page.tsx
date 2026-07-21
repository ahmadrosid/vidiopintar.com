import { EmptyStatePage } from "@/components/layouts/empty-state-page";
import { buildPageMetadata } from "@/lib/geo/metadata";

export const metadata = buildPageMetadata({
  title: "Explore",
  description: "Explore learning content on Vidiopintar.",
  path: "/explore",
  noIndex: true,
});

export default function ExplorePage() {
  return <EmptyStatePage page="explore" />;
}
