import { ExploreChannelsContent } from "@/components/explore/explore-channels-content";
import { getCurrentUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { getExploreChannelsForUser } from "@/lib/recommendations/get-explore-channels";

export const metadata = buildPageMetadata({
  title: "Channels for you",
  description: "Browse channels related to your learning on Vidiopintar.",
  path: "/explore/channels",
  noIndex: true,
});

export default async function ExploreChannelsPage() {
  const user = await getCurrentUser();
  const channels = await getExploreChannelsForUser(user.id);

  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ExploreChannelsContent channels={channels} />
    </div>
  );
}
