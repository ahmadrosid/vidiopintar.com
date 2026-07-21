import { EmptyStatePage } from "@/components/layouts/empty-state-page";
import { buildPageMetadata } from "@/lib/geo/metadata";

export const metadata = buildPageMetadata({
  title: "My Library",
  description: "Your Vidiopintar library.",
  path: "/library",
  noIndex: true,
});

export default function LibraryPage() {
  return <EmptyStatePage page="library" />;
}
