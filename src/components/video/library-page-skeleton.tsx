import { Skeleton } from "@/components/ui/skeleton";

const FILTER_CHIP_IDS = ['chip-1', 'chip-2', 'chip-3', 'chip-4', 'chip-5'] as const;
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

export function LibraryPageSkeleton() {
  return (
    <div className="w-full space-y-8" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <Skeleton className="h-9 w-44 md:h-10" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </header>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Skeleton className="h-10 w-full flex-1 rounded-xl" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_CHIP_IDS.map((chipId) => (
            <Skeleton key={chipId} className="h-9 w-28 rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {VIDEO_CARD_IDS.map((cardId) => (
            <VideoCardSkeleton key={cardId} />
          ))}
        </div>
      </div>
    </div>
  );
}
