"use client"

import { useState } from "react"
import { Markdown } from "@/components/ui/markdown"
import { Message, MessageContent } from "@/components/ui/message"
import { ChatContainerContent } from "@/components/ui/chat-container"
import { CopyButton } from "@/components/ui/copy-button";
import { Ellipsis } from "@/components/ui/loader";
import { ScrollButton } from "@/components/ui/scroll-button";
import { FeedbackButtons } from "@/components/chat/feedback-buttons";
import { Message as MessageType } from "@ai-sdk/react"
import { cn } from "@/lib/utils";

interface MessageItemProps {
    messages: MessageType[];
    status: string;
    videoId?: string;
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
                                    <Markdown>{message.content}</Markdown>
                                    <div className="group-hover:visible invisible bg-background/80 backdrop-blur-sm rounded-md p-1">
                                        <div className="flex items-center gap-2">
                                            {videoId && (
                                                <FeedbackButtons 
                                                    messageId={message.id} 
                                                    videoId={videoId} 
                                                    messageContent={message.content}
                                                    feedbackState={messageFeedback[message.id]}
                                                    onFeedbackSubmitted={handleFeedbackSubmitted}
                                                />
                                            )}
                                            <CopyButton content={message.content} copyMessage="Copied to clipboard" label="Copy" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
                                <MessageContent className="bg-secondary text-secondary-foreground p-3" markdown={true}>
                                    {message.content}
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
