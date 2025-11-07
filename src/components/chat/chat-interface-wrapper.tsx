"use client";

import { ChatInterface } from "./chat-interface";
import { useQuickQuestions } from "@/hooks/use-quick-questions";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatContainerRoot, ChatContainerContent } from "@/components/ui/chat-container";

interface ChatInterfaceWrapperProps {
  videoId: string;
  userVideoId: number;
  initialQuestions: string[];
  initialMessages: any[];
  isSharePage?: boolean;
  isLoggedIn?: boolean;
  shareChatUrl?: string;
}

export function ChatInterfaceWrapper({
  videoId,
  userVideoId,
  initialQuestions,
  initialMessages,
  shareChatUrl,
  isSharePage = false,
  isLoggedIn = false,
}: ChatInterfaceWrapperProps) {
  const { questions, isLoading, error } = useQuickQuestions({
    videoId,
    initialQuestions,
    // Don't auto-fetch if we already have questions or if there are existing messages
    enabled: initialQuestions.length === 0 && initialMessages.length === 0,
  });

  // Use the fetched questions if available, otherwise fall back to initial
  const quickStartQuestions = questions.length > 0 ? questions : initialQuestions;

  // Show skeleton loading only if:
  // 1. We're loading questions
  // 2. There are no initial questions
  // 3. There are no messages yet
  // 4. Not on share page (since share pages don't generate questions)
  const shouldShowSkeleton = isLoading &&
                             initialQuestions.length === 0 &&
                             initialMessages.length === 0 &&
                             !isSharePage;

  if (shouldShowSkeleton) {
    return (
      <div className="flex flex-col overflow-hidden h-screen h-screen-dvh w-full border-l">
        <ChatHeader
          videoId={videoId}
          userVideoId={userVideoId}
          shareChatUrl={shareChatUrl}
          setMessages={() => {}}
          isSharePage={isSharePage}
        />
        <ChatContainerRoot className="relative w-full flex-1 scrollbar-hidden">
          <ChatContainerContent className="flex flex-col gap-4 p-4 h-full justify-center">
            <div>
              <Skeleton className="h-6 w-64" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </ChatContainerContent>
        </ChatContainerRoot>
        <div className="p-4">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      videoId={videoId}
      userVideoId={userVideoId}
      initialMessages={initialMessages}
      quickStartQuestions={quickStartQuestions}
      shareChatUrl={shareChatUrl}
      isSharePage={isSharePage}
      isLoggedIn={isLoggedIn}
    />
  );
}
