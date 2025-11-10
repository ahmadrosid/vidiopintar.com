"use client"

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Square, MessageCircleMore } from "lucide-react"
import { useState, useEffect } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChatContainerRoot, ChatContainerContent, ChatContainerScrollAnchor } from "@/components/ui/chat-container"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input"
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageItem } from "@/components/chat/message-item";
import { useLocale } from "next-intl";

interface ChatInterfaceProps {
  videoId: string;
  userVideoId: number;
  quickStartQuestions: string[];
  initialMessages: any[];
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
  const [autoSaveNotes, setAutoSaveNotes] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [isCheckingPlan, setIsCheckingPlan] = useState(true);
  
  // Check if user has pro plan
  useEffect(() => {
    if (isSharePage) {
      setIsCheckingPlan(false);
      return;
    }

    const checkUserPlan = async () => {
      try {
        const response = await fetch('/api/user/usage-stats');
        if (response.ok) {
          const data = await response.json();
          const isPro = data.currentPlan === 'monthly' || data.currentPlan === 'yearly';
          setIsProUser(isPro);
          // Disable autoSaveNotes if user is not pro
          if (!isPro) {
            setAutoSaveNotes(false);
          }
        } else if (response.status === 401) {
          // User is not logged in, hide toggle
          setIsProUser(false);
          setAutoSaveNotes(false);
        }
      } catch (error) {
        console.error('Failed to check user plan:', error);
      } finally {
        setIsCheckingPlan(false);
      }
    };

    checkUserPlan();
  }, [isSharePage]);

  // Ensure autoSaveNotes is disabled if user is not pro
  useEffect(() => {
    if (!isProUser && autoSaveNotes) {
      setAutoSaveNotes(false);
    }
  }, [isProUser, autoSaveNotes]);
  
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    status,
    setMessages,
  } = useChat({
    api: '/api/chat',
    initialMessages,
    body: { videoId, userVideoId, language, autoSaveNotes },
  });

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
                  <form
                    key={index}
                    onSubmit={(e) => {
                      handleSubmit(e as any);
                    }}>
                    <button
                      type="submit"
                      onClick={() => flushSync(() => setInput(question))}
                      className="text-sm text-left p-2 rounded bg-secondary border border-border/25 text-foreground/85 cursor-pointer hover:border-accent-foreground/75">
                      {question}
                    </button>
                  </form>
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
            <PromptInputActions className="justify-end gap-2 pt-2">
              {!isCheckingPlan && isProUser && (
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="auto-save-notes" 
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Notes agent
                  </Label>
                  <Switch
                    id="auto-save-notes"
                    checked={autoSaveNotes}
                    onCheckedChange={setAutoSaveNotes}
                  />
                </div>
              )}
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
