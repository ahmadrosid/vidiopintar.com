"use client"

import { Share2, Trash2, Loader, Link as LinkIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { CopyButton } from "@/components/ui/copy-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { createShareVideo, clearChatMessages } from "@/lib/services/api";
import { toast } from "sonner";

interface ChatHeaderProps {
    videoId: string;
    userVideoId: number;
    isSharePage?: boolean;
    isLoggedIn?: boolean;
    shareChatUrl?: string;
    setMessages: (messages: any[]) => void;
}

export function ChatHeader({
    videoId,
    userVideoId,
    shareChatUrl,
    setMessages,
    isSharePage = false }: ChatHeaderProps) {
    const [status, setStatus] = useState<"" | "deleting" | "sharing">("");

    const [shareUrl, setShareUrl] = useState(shareChatUrl);

    const handleShareClick = async () => {
        if (isSharePage) return;
        setStatus("sharing");
        try {
            const response = await createShareVideo({ youtubeId: videoId, userVideoId })
            setShareUrl(response.url);
        } catch (error) {
            toast.error("Failed to generate share URL");
        } finally {
            setStatus("");
        }
    };

    const handleClearMessages = async () => {
        if (isSharePage || status === "deleting") return;

        setStatus("deleting");
        try {
            await clearChatMessages({ userVideoId });
            setMessages([]);
            toast.success("Chat messages cleared successfully");
        } catch (error) {
            toast.error("Failed to clear chat messages");
        } finally {
            setStatus("");
        }
    };

    return (
        <div className="px-4 py-2.5 border-b bg-white dark:bg-black sticky top-0 z-50 flex justify-between items-center">
            <h2 className="font-semibold tracking-tight dark:text-foreground">Chat</h2>
            <div className="flex gap-2">
                <Popover onOpenChange={(open) => {
                    if (open && !shareUrl && status !== "sharing") {
                        handleShareClick();
                    }
                }}>
                    <PopoverTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <Share2 className="size-4" />
                    </PopoverTrigger>
                    <PopoverContent side="bottom" align="end" className="w-80">
                        {status === "sharing" ? (
                            <div className="py-2 gap-2 flex items-center justify-center">
                                <Loader className="size-4 animate-spin" />
                                <p className="text-sm text-center text-muted-foreground">Generating share link...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <h4 className="font-medium">Share this chat</h4>
                                <p className="text-sm text-muted-foreground">Anyone with this link can view this chat</p>
                                <div className="flex items-center space-x-2 pt-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                                            <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                                            {shareUrl && <span className="text-sm truncate">{shareUrl}</span>}
                                        </div>
                                    </div>
                                    {shareUrl && <CopyButton content={shareUrl} copyMessage="Link copied!" />}
                                </div>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
                {!isSharePage && (
                    <Tooltip>
                        <TooltipTrigger
                            className={buttonVariants({ variant: "ghost", size: "icon" })}
                            onClick={handleClearMessages}
                            disabled={status === "deleting"}
                        >
                            {status === "deleting" ? <Loader className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{status === "deleting" ? "Clearing..." : "Clear chat messages"}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </div>
    )
}
