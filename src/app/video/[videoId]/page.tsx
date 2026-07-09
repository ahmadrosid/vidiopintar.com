import { Suspense } from "react";
import { VideoSection } from "@/components/video/video-section";
import { ChatSection } from "@/components/video/chat-section";
import { VideoSectionSkeleton } from "@/components/video/video-section-skeleton";
import { ChatSectionSkeleton } from "@/components/video/chat-section-skeleton";
import { ResizableLayout } from "@/components/video/resizable-layout";
import { fetchVideoDetails, fetchVideoTranscript } from "@/lib/youtube";

export default async function VideoPage(props: {
  params: Promise<{ videoId: string }>;
}) {
  const params = await props.params;
  const { videoId } = params;

  const videoDetailsPromise = fetchVideoDetails(videoId);
  const transcriptPromise = fetchVideoTranscript(videoId);

  return (
    <main className="flex flex-col min-h-screen bg-melody-gradient relative">
      <div className="relative z-10">
        <div className="hidden lg:block">
          <ResizableLayout
            videoSection={
              <Suspense fallback={<VideoSectionSkeleton />}>
                <VideoSection
                  videoId={videoId}
                  videoDetailsPromise={videoDetailsPromise}
                  transcriptPromise={transcriptPromise}
                />
              </Suspense>
            }
            chatSection={
              <Suspense fallback={<ChatSectionSkeleton />}>
                <ChatSection
                  videoId={videoId}
                  videoDetailsPromise={videoDetailsPromise}
                  transcriptPromise={transcriptPromise}
                />
              </Suspense>
            }
          />
        </div>
        {/* Mobile layout - stacked vertically */}
        <div className="lg:hidden flex flex-col h-screen">
          <div className="h-full overflow-y-auto scrollbar-none relative">
            <Suspense fallback={<VideoSectionSkeleton />}>
              <VideoSection
                videoId={videoId}
                videoDetailsPromise={videoDetailsPromise}
                transcriptPromise={transcriptPromise}
              />
            </Suspense>
          </div>
          <div className="flex flex-col h-full relative border-t">
            <Suspense fallback={<ChatSectionSkeleton />}>
              <ChatSection
                videoId={videoId}
                videoDetailsPromise={videoDetailsPromise}
                transcriptPromise={transcriptPromise}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
