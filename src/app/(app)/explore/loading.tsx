import { ExplorePageSkeleton } from "@/components/explore/explore-page-skeleton";

export default function ExploreLoading() {
  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <ExplorePageSkeleton />
    </div>
  );
}
