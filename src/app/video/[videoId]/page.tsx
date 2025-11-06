import { Suspense } from "react";
import { Crown, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { UserPlanService } from "@/lib/user-plan-service";
import { getTranslations } from "next-intl/server";
import { VideoSection } from "@/components/video/video-section";
import { ChatSection } from "@/components/video/chat-section";
import { VideoSectionSkeleton } from "@/components/video/video-section-skeleton";
import { ChatSectionSkeleton } from "@/components/video/chat-section-skeleton";
import { fetchVideoDetails, fetchVideoTranscript } from "@/lib/youtube";

export default async function VideoPage(props: {
  params: Promise<{ videoId: string }>;
}) {
  const params = await props.params;
  const user = await getCurrentUser();
  const { videoId } = params;

  const canAddVideo = await UserPlanService.canAddVideo(user.id);

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
                <div className="bg-card border rounded-lg p-4">
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
                    <Button className="w-full cursor-pointer">
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

  const videoDetailsPromise = fetchVideoDetails(videoId);
  const transcriptPromise = fetchVideoTranscript(videoId);

  return (
    <main className="flex flex-col min-h-screen bg-melody-gradient relative">
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 h-screen">
          <div className="lg:col-span-4 h-full overflow-y-auto scrollbar-none relative">
            <Suspense fallback={<VideoSectionSkeleton />}>
              <VideoSection
                videoId={videoId}
                videoDetailsPromise={videoDetailsPromise}
                transcriptPromise={transcriptPromise}
              />
            </Suspense>
          </div>

          <div className="lg:col-span-3 flex flex-col h-full md:h-auto relative">
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
