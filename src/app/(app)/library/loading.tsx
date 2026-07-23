import { LibraryPageSkeleton } from "@/components/video/library-page-skeleton";

export default function LibraryLoading() {
  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <LibraryPageSkeleton />
    </div>
  );
}
