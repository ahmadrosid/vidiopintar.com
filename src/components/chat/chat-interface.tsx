"use client"

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Square, MessageCircleMore } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/ui/chat-container"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageItem } from "@/components/chat/message-item";
import { toUIMessages } from "@/lib/ai/messages";
import { useLocale } from "next-intl";

interface ChatInterfaceProps {
  videoId: string;
  userVideoId: number;
  quickStartQuestions: string[];
  initialMessages: Array<{ id: string; content: string; role: 'user' | 'assistant' }>;
  isSharePage?: boolean;
  isLoggedIn?: boolean;
  shareChatUrl?: string;
}

export function ChatInterface({
  videoId,
  userVideoId,
  initialMessages,
  quickStartQuestions,
  shareChatUrl,
  isSharePage = false,
  isLoggedIn = false }: ChatInterfaceProps) {
  const language = useLocale();
  const [input, setInput] = useState('');
  const transport = useMemo(
    () => new DefaultChatTransport({
      api: '/api/chat',
      body: { videoId, userVideoId, language },
    }),
    [videoId, userVideoId, language]
  );
  
  const {
    messages,
    sendMessage,
    status,
    setMessages,
  } = useChat({
    transport,
    messages: toUIMessages(initialMessages),
  });

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    const text = input.trim();
    if (!text || status === 'streaming' || status === 'submitted') {
      return;
    }

    sendMessage({ text });
    setInput('');
  };

  return (
    <div className="flex flex-col overflow-hidden h-full w-full border-l min-h-0 max-h-full">
      <ChatHeader
        videoId={videoId}
        userVideoId={userVideoId}
        shareChatUrl={shareChatUrl}
        setMessages={setMessages}
        isSharePage={isSharePage}
      />
      <ChatContainerRoot className="relative w-full flex-1 min-h-0">
        {messages.length === 0 && quickStartQuestions.length > 0 ? (
          <ChatContainerContent className="flex flex-col gap-4 p-4 h-full justify-center">
            <div>
              <p className="text-left py-2 text-foreground/75 font-semibold tracking-tight">
                Start chatting with these quick questions!
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {quickStartQuestions.map((question, index) => (
                isSharePage ? (
                  <p
                    key={index}
                    className="text-sm text-left p-2 rounded bg-secondary border border-border/25 text-foreground/50 cursor-not-allowed">
                    {question}
                  </p>
                ) : (
                  <button
                    key={index}
                    type="button"
                    onClick={() => sendMessage({ text: question })}
                    className="text-sm text-left p-2 rounded bg-secondary border border-border/25 text-foreground/85 cursor-pointer hover:border-accent-foreground/75">
                    {question}
                  </button>
                )
              ))}
            </div>
            <ChatContainerScrollAnchor />
          </ChatContainerContent>
        ) : (
          <MessageItem
            messages={messages}
            status={status}
            videoId={videoId}
          />
        )}
      </ChatContainerRoot>
      <div className="p-4 flex-shrink-0">
        {isSharePage ? (
          <div className="text-center text-sm text-muted-foreground">
            {isLoggedIn ? (
              <a href={`/video/${videoId}`}>
                <Button variant="default">
                  <MessageCircleMore className="mr-2 size-4" />
                  Click to continue this conversation
                </Button>
              </a>
            ) : (
              <a href="/login">
                <Button variant="default">
                  <MessageCircleMore className="mr-2 size-4" />
                  Login to continue conversation
                </Button>
              </a>
            )}
          </div>
        ) : (
          <PromptInput
            value={input}
            onValueChange={(value) => setInput(value)}
            isLoading={status === "streaming"}
            onSubmit={handleSubmit}
            className="w-full"
          >
            <PromptInputTextarea className="bg-transparent!" placeholder="Ask anything..." />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={status === "streaming" ? "Stop generation" : "Send message"}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleSubmit}
                >
                  {status === "streaming" ? (
                    <Square className="size-5 fill-current" />
                  ) : (
                    <ArrowUp className="size-5" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
        )}
      </div>
    </div>
  )
}
