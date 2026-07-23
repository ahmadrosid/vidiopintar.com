import { Suspense } from "react";
import { VideoRepository } from "@/lib/db/repository";
import { VideoListWithFilter } from "@/components/video/video-list-with-filter";
import { LibraryPageSkeleton } from "@/components/video/library-page-skeleton";
import { getCurrentUser } from "@/lib/auth";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { getTranslations } from "next-intl/server";

export const metadata = buildPageMetadata({
  title: "My Library",
  description: "Your Vidiopintar library.",
  path: "/library",
  noIndex: true,
});

async function LibraryPageContent() {
  const user = await getCurrentUser();
  const videos = await VideoRepository.getAllForUserWithDetails(user.id);
  const t = await getTranslations("library");

  return (
    <>
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {t("subtitle")}
        </p>
      </header>

      <VideoListWithFilter videos={videos} variant="library" />
    </>
  );
}

export default function LibraryPage() {
  return (
    <div className="w-full space-y-8 px-4 pb-12 pt-4 md:px-8 md:pt-6">
      <Suspense fallback={<LibraryPageSkeleton />}>
        <LibraryPageContent />
      </Suspense>
    </div>
  );
}
