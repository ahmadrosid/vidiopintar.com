import { Skeleton } from "@/components/ui/skeleton";

function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-card ${className ?? ""}`}
    >
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-2 px-3 py-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function SectionSkeleton({ cardCount = 4 }: { cardCount?: number }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: cardCount }).map((_, index) => (
          <VideoCardSkeleton
            key={index}
            className="w-[16.5rem] shrink-0 sm:w-[18rem]"
          />
        ))}
      </div>
    </section>
  );
}

function ChannelCardSkeleton() {
  return (
    <div className="flex w-56 shrink-0 items-center gap-3 rounded-xl border border-border bg-card p-3">
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ExplorePageSkeleton() {
  return (
    <div className="w-full space-y-8" aria-busy="true" aria-live="polite">
      <header className="space-y-2">
        <Skeleton className="h-9 w-40 md:h-10" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </header>

      <Skeleton className="h-11 w-full rounded-xl" />

      <section className="space-y-4">
        <Skeleton className="h-7 w-44" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 shrink-0 rounded-xl" />
          ))}
        </div>
      </section>

      <SectionSkeleton />
      <SectionSkeleton />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <ChannelCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
