import { fetchVideoDetails, fetchVideoTranscript } from "@/lib/youtube";
import { VideoPlayer } from "@/components/video/video-player";
import { TranscriptView } from "@/components/video/transcript-view";
import { CommentsView } from "@/components/video/comments-view";
import { NotesView } from "@/components/video/notes-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { SummarySection } from "@/components/video/summary-section";
import { TipsAlert } from "@/components/chat/tips-alert";
import { LanguageSelector } from "@/components/language-selector";
import { getTranslations } from "next-intl/server";

interface VideoSectionProps {
  videoId: string;
  videoDetailsPromise: ReturnType<typeof fetchVideoDetails>;
  transcriptPromise: ReturnType<typeof fetchVideoTranscript>;
}

export async function VideoSection({ videoId, videoDetailsPromise, transcriptPromise }: VideoSectionProps) {
  // Use promises passed from parent to prevent duplicate fetches
  const videoDetails = await videoDetailsPromise;
  const transcript = await transcriptPromise;

  const t = await getTranslations("video");

  // Handle transcript error
  if (transcript.error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">
          Video Not Supported
        </h2>
        <p className="text-muted-foreground">
          {transcript.errorMessage ||
            "This video doesn't have a transcript available."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-50 bg-white dark:bg-black border-b">
        <div className="flex items-center p-2.5 gap-2">
          <a
            href="/home"
            className="text-foreground hover:underline hover:text-melody transition-colors inline-flex gap-2 items-center"
          >
            Home
          </a>
          <ChevronRight className="size-5 text-muted-foreground" />
          <h1 className="font-semibold tracking-tight flex-1 truncate">
            {videoDetails.title}
          </h1>
          <LanguageSelector />
        </div>
      </div>

      <VideoPlayer videoId={videoId} />

      <div className="relative">
        <Tabs defaultValue="summary" className="w-full p-3">
          <TabsList>
            <TabsTrigger value="summary">
              <span className="flex items-center gap-2">{t("summary")}</span>
            </TabsTrigger>
            <TabsTrigger value="transcript">
              <span className="flex items-center gap-2">{t("transcript")}</span>
            </TabsTrigger>
            <TabsTrigger value="comments">
              <span className="flex items-center gap-2">{t("comments")}</span>
            </TabsTrigger>
            {videoDetails.userVideo?.id && (
              <TabsTrigger value="notes">
                <span className="flex items-center gap-2">{t("notesTab")}</span>
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent
            value="summary"
            className="h-full overflow-y-auto p-0 m-0"
          >
            <SummarySection
              videoId={videoId}
              initialSummary={videoDetails.userVideo?.summary ?? ""}
            />
          </TabsContent>
          <TabsContent
            value="transcript"
            className="h-full overflow-y-auto p-0 m-0"
          >
            <TranscriptView transcript={transcript} />
          </TabsContent>
          <TabsContent
            value="comments"
            className="h-full overflow-y-auto p-0 m-0"
          >
            <CommentsView videoId={videoId} />
          </TabsContent>
          {videoDetails.userVideo?.id && (
            <TabsContent
              value="notes"
              className="h-full overflow-y-auto p-0 m-0"
            >
              <NotesView userVideoId={videoDetails.userVideo.id} />
            </TabsContent>
          )}
        </Tabs>
        <TipsAlert videoId={videoId} />
      </div>
    </>
  );
}
