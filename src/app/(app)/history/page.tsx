import { EmptyStatePage } from "@/components/layouts/empty-state-page";
import { buildPageMetadata } from "@/lib/geo/metadata";

export const metadata = buildPageMetadata({
  title: "History",
  description: "Your watch history on Vidiopintar.",
  path: "/history",
  noIndex: true,
});

export default function HistoryPage() {
  return <EmptyStatePage page="history" />;
}
