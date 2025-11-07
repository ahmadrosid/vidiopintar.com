import {
  fetchVideoDetails,
  fetchVideoTranscript,
} from "@/lib/youtube";
import { getChatHistory } from "@/lib/storage";
import { ChatInterfaceWrapper } from "@/components/chat/chat-interface-wrapper";
import { UserPlanService } from "@/lib/user-plan-service";
import { getCurrentUser } from "@/lib/auth";
import { AlertTriangle, Clock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface ChatSectionProps {
  videoId: string;
  videoDetailsPromise: ReturnType<typeof fetchVideoDetails>;
  transcriptPromise: ReturnType<typeof fetchVideoTranscript>;
}

export async function ChatSection({ videoId, videoDetailsPromise, transcriptPromise }: ChatSectionProps) {
  const user = await getCurrentUser();
  const canAddVideo = await UserPlanService.canAddVideo(user.id);

  // If user has reached limit, show upgrade prompt
  if (!canAddVideo.canAdd) {
    const tLimit = await getTranslations("limitDialog");

    return (
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
    );
  }

  // Use promises passed from parent to prevent duplicate fetches
  const videoDetails = await videoDetailsPromise;
  const transcript = await transcriptPromise;

  // Handle missing userVideo or transcript error
  if (!videoDetails.userVideo && !transcript.userVideo) {
    const errorMessage = transcript.error
      ? transcript.errorMessage || "Transcript not available for this video"
      : "Unable to load chat interface. Video details are incomplete.";

    return (
      <div className="p-4 text-center h-screen h-screen-dvh w-full border-l">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground max-w-md">
            {errorMessage}
          </p>
          {transcript.error && (
            <p className="text-sm text-muted-foreground">
              This video may not have captions available, or captions are disabled by the creator.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Get userVideo (from either source)
  const userVideo = videoDetails.userVideo || transcript.userVideo;

  // Load chat history
  const messages = await getChatHistory(videoId, userVideo!.id);

  // Quick start questions will be loaded client-side to avoid blocking page load
  const quickStartQuestions = userVideo?.quickStartQuestions ?? [];

  return (
    <ChatInterfaceWrapper
      videoId={videoId}
      userVideoId={userVideo!.id}
      initialMessages={messages}
      initialQuestions={quickStartQuestions}
    />
  );
}
