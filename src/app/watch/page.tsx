import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { extractVideoId } from "@/lib/utils";

async function ProcessAndRedirect({ videoUrl }: { videoUrl: string }) {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return <div>Invalid video URL provided.</div>;
  }
  redirect(`/video/${videoId}`);

  return null;
}

export default async function WatchPage(props: {
  searchParams: Promise<{ v?: string }>;
}) {
  const searchParams = await props.searchParams;
  if (!searchParams.v) {
    return (
      <div className="container mx-auto py-12 text-center">
        Video ID is missing from URL.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 text-center flex flex-col items-center justify-center min-h-screen">
      <Suspense
        fallback={<LoadingSpinner text="Please wait processing video..." />}
      >
        <ProcessAndRedirect
          videoUrl={`https://www.youtube.com/watch?v=${searchParams.v}`}
        />
      </Suspense>
    </div>
  );
}
