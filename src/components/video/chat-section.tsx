import {
  fetchVideoDetails,
  fetchVideoTranscript,
} from "@/lib/youtube";
import { getChatHistory } from "@/lib/storage";
import { ChatInterfaceWrapper } from "@/components/chat/chat-interface-wrapper";
import { UserPlanService } from "@/lib/user-plan-service";
import { getCurrentUser } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";

interface ChatSectionProps {
  videoId: string;
  videoDetailsPromise: ReturnType<typeof fetchVideoDetails>;
  transcriptPromise: ReturnType<typeof fetchVideoTranscript>;
}

export async function ChatSection({ videoId, videoDetailsPromise, transcriptPromise }: ChatSectionProps) {
  const user = await getCurrentUser();

  const videoDetails = await videoDetailsPromise;
  const transcript = await transcriptPromise;

  if (!videoDetails.userVideo && !transcript.userVideo) {
    const errorMessage = transcript.error
      ? transcript.errorMessage || "Transcript not available for this video"
      : "Unable to load chat interface. Video details are incomplete.";

    return (
      <div className="p-4 text-center h-full min-h-0 w-full border-l">
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

  const userVideo = videoDetails.userVideo || transcript.userVideo;
  const messageUsage = await UserPlanService.canSendMessage(user.id, userVideo!.id);
  const messageLimitReached = !messageUsage.canSend && messageUsage.reason === 'message_limit_reached';
  const messages = await getChatHistory(videoId, userVideo!.id);
  const quickStartQuestions = userVideo?.quickStartQuestions ?? [];

  return (
    <ChatInterfaceWrapper
      videoId={videoId}
      userVideoId={userVideo!.id}
      initialMessages={messages}
      initialQuestions={messageLimitReached ? [] : quickStartQuestions}
      messageLimitReached={messageLimitReached}
      messageLimit={messageUsage.messageLimit}
      messagesRemaining={
        messageUsage.messageLimit != null && messageUsage.messagesUsed != null
          ? messageUsage.messageLimit - messageUsage.messagesUsed
          : undefined
      }
    />
  );
}
