import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoSearchSkeleton() {
  return (
    <Card className="overflow-hidden rounded-xs shadow-none border-none bg-card">
      <div className="aspect-video relative">
        <Skeleton className="w-full h-full" />
        <Skeleton className="absolute bottom-2 right-2 w-12 h-5 rounded" />
      </div>
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </Card>
  );
}

interface VideoSearchSkeletonGridProps {
  count?: number;
}

export function VideoSearchSkeletonGrid({ count = 8 }: VideoSearchSkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <VideoSearchSkeleton key={index} />
      ))}
    </div>
  );
}

