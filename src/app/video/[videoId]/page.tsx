import {
  fetchVideoDetails,
  fetchVideoTranscript,
  generateQuickStartQuestions,
} from "@/lib/youtube";
import { VideoPlayer } from "@/components/video/video-player";
import { getChatHistory } from "@/lib/storage";
import { TranscriptView } from "@/components/video/transcript-view";
import { CommentsView } from "@/components/video/comments-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Crown, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChatInterface } from "@/components/chat/chat-interface";
import { SummarySection } from "@/components/video/summary-section";
import { getCurrentUser } from "@/lib/auth";
import { TipsAlert } from "@/components/chat/tips-alert";
import { LanguageSelector } from "@/components/language-selector";
import { UserPlanService } from "@/lib/user-plan-service";
import { getTranslations } from "next-intl/server";

export default async function VideoPage(props: {
  params: Promise<{ videoId: string }>;
}) {
  const params = await props.params;
  const user = await getCurrentUser();
  const { videoId } = params;

  // Check if user has reached their daily limit before fetching video data
  const canAddVideo = await UserPlanService.canAddVideo(user.id);

  // If user has reached limit, show upgrade message without fetching video data
  if (!canAddVideo.canAdd) {
    const t = await getTranslations("limitDialog");

    return (
      <main className="flex flex-col min-h-screen bg-melody-gradient relative">
        <div className="relative z-10">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {t("title")}
                  </h2>
                  <p className="text-muted-foreground">{t("description")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {t("premiumBenefits")}
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>✨ {t("benefits.unlimited")}</li>
                    <li>🤖 {t("benefits.ai")}</li>
                    <li>⚡ {t("benefits.support")}</li>
                    <li>🔥 {t("benefits.features")}</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/profile/billing">
                    <Button className="w-full">
                      <Crown className="w-4 h-4 mr-2" />
                      {t("upgradeNow")}
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {t("waitTomorrow")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  let videoDetails = await fetchVideoDetails(videoId);
  let transcript = await fetchVideoTranscript(videoId);
  let messages: any[] = [];
  let quickStartQuestions: string[] = [];

  // If transcript is not available, show error state
  if (transcript.error) {
    return (
      <main className="flex flex-col min-h-screen bg-melody-gradient relative">
        <div className="relative z-10">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">
                  Video Not Supported
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  {transcript.errorMessage ||
                    "This video doesn't have a transcript available, which is required for our chat functionality."}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Please try a different video that has captions or subtitles
                  enabled. Note that we don't support live streaming YouTube
                  videos.
                </p>
                <a
                  href="/home"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!videoDetails.userVideo) {
    videoDetails.userVideo = transcript.userVideo;
  } else {
    messages = await getChatHistory(videoId, videoDetails.userVideo.id);
    quickStartQuestions = videoDetails.userVideo.quickStartQuestions ?? [];
  }

  if (quickStartQuestions.length === 0 && videoDetails.userVideo?.summary) {
    quickStartQuestions = await generateQuickStartQuestions(
      `${videoDetails.title}\n${videoDetails.description}\nSummary: \n${videoDetails.userVideo.summary}`,
      videoDetails.userVideo.id,
      videoId
    );
  }

  const t = await getTranslations("video");
  const tLimit = await getTranslations("limitDialog");

  return (
    <main className="flex flex-col min-h-screen bg-melody-gradient relative">
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 h-screen">
          <div className="lg:col-span-4 h-full overflow-y-auto scrollbar-none relative">
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
                    <span className="flex items-center gap-2">
                      {t("summary")}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="transcript">
                    <span className="flex items-center gap-2">
                      {t("transcript")}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    <span className="flex items-center gap-2">
                      {t("comments")}
                    </span>
                  </TabsTrigger>
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
              </Tabs>
              <TipsAlert videoId={videoId} />
            </div>
          </div>
          <div className="lg:col-span-3 flex flex-col h-full md:h-auto relative">
            {!canAddVideo.canAdd ? (
              <div className="flex flex-col items-center justify-center h-screen h-screen-dvh w-full p-6 text-center space-y-6 border-l">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">
                      {tLimit("title")}
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                      {tLimit("description")}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 w-full max-w-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      {tLimit("premiumBenefits")}
                    </h3>
                    <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <li>✨ {tLimit("benefits.unlimited")}</li>
                      <li>🤖 {tLimit("benefits.ai")}</li>
                      <li>⚡ {tLimit("benefits.support")}</li>
                      <li>🔥 {tLimit("benefits.features")}</li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link href="/profile/billing">
                      <Button className="w-full">
                        <Crown className="w-4 h-4 mr-2" />
                        {tLimit("upgradeNow")}
                      </Button>
                    </Link>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {tLimit("waitTomorrow")}
                    </div>
                  </div>
                </div>
              </div>
            ) : videoDetails.userVideo ? (
              <ChatInterface
                videoId={videoId}
                userVideoId={videoDetails.userVideo.id}
                initialMessages={messages}
                quickStartQuestions={quickStartQuestions}
              />
            ) : (
              <div className="p-4 text-center h-screen h-screen-dvh w-full">
                <p className="text-muted-foreground">
                  Unable to load chat interface. Video details are incomplete.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
