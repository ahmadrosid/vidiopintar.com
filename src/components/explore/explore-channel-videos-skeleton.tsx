import { Skeleton } from "@/components/ui/skeleton";

const VIDEO_CARD_IDS = ['card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-6', 'card-7', 'card-8'] as const;

function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 px-3 py-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ExploreChannelVideosSkeleton() {
  return (
    <div className="w-full space-y-8" aria-busy="true" aria-live="polite">
      <div className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <header className="flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-9 w-48 max-w-full md:h-10 md:w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {VIDEO_CARD_IDS.map((cardId) => (
          <VideoCardSkeleton key={cardId} />
        ))}
      </div>
    </div>
  );
}
