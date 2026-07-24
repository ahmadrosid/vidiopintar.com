"use client";

import { ChatInterface } from "./chat-interface";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatContainerRoot, ChatContainerContent } from "@/components/ui/chat-container";
import type { QuizEntitlements, QuizState } from "@/lib/quiz/types";

interface ChatInterfaceWrapperProps {
  videoId: string;
  userVideoId: number;
  initialQuestions: string[];
  initialMessages: any[];
  initialQuiz?: QuizState | null;
  initialQuizEntitlements?: QuizEntitlements | null;
  isSharePage?: boolean;
  isLoggedIn?: boolean;
  shareChatUrl?: string;
  messageLimitReached?: boolean;
  messageLimit?: number;
  messagesRemaining?: number;
}

export function ChatInterfaceWrapper({
  videoId,
  userVideoId,
  initialQuestions,
  initialMessages,
  initialQuiz = null,
  initialQuizEntitlements = null,
  shareChatUrl,
  isSharePage = false,
  isLoggedIn = false,
  messageLimitReached = false,
  messageLimit,
  messagesRemaining,
}: ChatInterfaceWrapperProps) {
  return (
    <ChatInterface
      videoId={videoId}
      userVideoId={userVideoId}
      initialMessages={initialMessages}
      quickStartQuestions={initialQuestions}
      initialQuiz={initialQuiz}
      initialQuizEntitlements={initialQuizEntitlements}
      shareChatUrl={shareChatUrl}
      isSharePage={isSharePage}
      isLoggedIn={isLoggedIn}
      messageLimitReached={messageLimitReached}
      messageLimit={messageLimit}
      messagesRemaining={messagesRemaining}
    />
  );
}
