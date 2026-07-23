"use client"

import { useState } from "react"
import { CircleCheck, Loader2, StickyNote } from "lucide-react"
import { Markdown } from "@/components/ui/markdown"
import { Message, MessageContent } from "@/components/ui/message"
import { ChatContainerContent } from "@/components/ui/chat-container"
import { CopyButton } from "@/components/ui/copy-button";
import { Ellipsis } from "@/components/ui/loader";
import { ScrollButton } from "@/components/ui/scroll-button";
import { FeedbackButtons } from "@/components/chat/feedback-buttons";
import { getMessageText } from "@/lib/ai/messages";
import type { CreateNoteToolResult } from "@/lib/ai/create-note-tool";
import type { UIMessage } from "ai";
import { cn, formatTime } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface MessageItemProps {
    messages: UIMessage[];
    status: string;
    videoId?: string;
}

interface CreateNoteToolPartProps {
  type: "tool-createNote";
  toolCallId: string;
  state: "input-streaming" | "input-available" | "output-available" | "output-error";
  output?: CreateNoteToolResult;
  errorText?: string;
}

function truncateNotePreview(text: string, maxLength = 48): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function CreateNoteToolPart({ part }: { part: CreateNoteToolPartProps }) {
  const t = useTranslations("video.notes");

  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md border border-border/40 bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 shrink-0 animate-spin" />
        <span>{t("aiNoteSaving")}</span>
      </div>
    );
  }

  if (part.state === "output-error") {
    return (
      <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
        <StickyNote className="size-3.5 shrink-0" />
        <span className="truncate">{part.errorText ?? t("aiNoteFailed")}</span>
      </div>
    );
  }

  if (part.state === "output-available") {
    const output = part.output as CreateNoteToolResult | undefined;

    if (output?.success && output.note) {
      const preview = truncateNotePreview(output.note.text);

      return (
        <div
          className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300"
          role="status"
        >
          <CircleCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate">
            <span className="font-medium">{t("aiNoteSaved", { time: formatTime(output.note.timestamp) })}</span>
            {preview ? (
              <span className="text-emerald-700/80 dark:text-emerald-300/80"> · {preview}</span>
            ) : null}
          </span>
        </div>
      );
    }

    return (
      <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive">
        <StickyNote className="size-3.5 shrink-0" />
        <span className="truncate">
          {output && !output.success
            ? output.error
            : t("aiNoteFailed")}
        </span>
      </div>
    );
  }

  return null;
}

export function MessageItem({ messages, status, videoId }: MessageItemProps) {
    const [messageFeedback, setMessageFeedback] = useState<Record<string, { rating: string; hasSubmitted: boolean }>>({})

    const handleFeedbackSubmitted = (messageId: string, rating: string) => {
        setMessageFeedback(prev => ({
            ...prev,
            [messageId]: { rating, hasSubmitted: true }
        }))
    }

    return (
        <ChatContainerContent className="gap-4 p-4"
            style={{
                scrollbarGutter: "stable both-edges",
                scrollbarWidth: "none",
            }}>
            {messages.map((message) => {
                const isAssistant = message.role === "assistant"
                const messageText = getMessageText(message)
                return (
                    <Message
                        key={message.id}
                        className={
                            cn("relative group", message.role === "user" ? "justify-end" : "justify-start")
                        }
                    >
                        {isAssistant ? (
                            <div className="w-full flex-1">
                                <div className="prose dark:prose-invert prose-sm px-2 py-6 max-w-none">
                                    {message.parts.map((part, index) => {
                                      if (part.type === "text" && part.text) {
                                        return <Markdown key={index}>{part.text}</Markdown>;
                                      }
                                      if (part.type === "tool-createNote") {
                                        return (
                                          <CreateNoteToolPart
                                            key={index}
                                            part={part as unknown as CreateNoteToolPartProps}
                                          />
                                        );
                                      }
                                      return null;
                                    })}
                                    {messageText ? (
                                    <div className="group-hover:visible invisible bg-background/80 backdrop-blur-sm rounded-md p-1">
                                        <div className="flex items-center gap-2">
                                            {videoId && (
                                                <FeedbackButtons 
                                                    messageId={message.id} 
                                                    videoId={videoId} 
                                                    messageContent={messageText}
                                                    feedbackState={messageFeedback[message.id]}
                                                    onFeedbackSubmitted={handleFeedbackSubmitted}
                                                />
                                            )}
                                            <CopyButton content={messageText} copyMessage="Copied to clipboard" label="Copy" />
                                        </div>
                                    </div>
                                    ) : null}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
                                <MessageContent className="bg-secondary text-secondary-foreground p-3" markdown={true}>
                                    {messageText}
                                </MessageContent>
                            </div>
                        )}
                    </Message>
                )
            })}
            {status === "submitted" && <div className="px-2 py-6">
                <Ellipsis className="text-secondary-foreground/25" />
            </div>}
            <div className="absolute inset-x-0 bottom-2">
                <div className="flex justify-center w-full">
                    <ScrollButton className="shadow-none" />
                </div>
            </div>
        </ChatContainerContent>
    )
}
