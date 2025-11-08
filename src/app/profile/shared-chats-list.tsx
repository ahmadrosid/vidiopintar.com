"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ExternalLink } from "lucide-react";
import { useTranslations } from 'next-intl';

interface SharedChatsListProps {
  items: Array<{
    slug: string;
    youtubeId: string;
    title: string;
    thumbnailUrl: string | null;
    createdAt: Date;
  }>;
}

export function SharedChatsList({ items }: SharedChatsListProps) {
  const t = useTranslations('profile');
  
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.slug}
          className="p-4 rounded-xs transition-all duration-200 bg-card hover:bg-card/50 relative group"
        >
          <div className="flex gap-4">
            <img 
              src={item.thumbnailUrl || ""} 
              alt={item.title}
              className="w-32 h-20 object-cover rounded shrink-0"
            />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* Video info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt))} {t('sharedChats.ago')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/shared/${item.slug}`}>
                  <Button size="sm" variant="default" className="text-xs h-7 px-2 cursor-pointer">
                    <ExternalLink className="size-3 mr-1" />
                    {t('sharedChats.view')}
                  </Button>
                </Link>
                <CopyButton
                  content={`${window.location.origin}/shared/${item.slug}`}
                  copyMessage={t('sharedChats.linkCopied')}
                  label={t('sharedChats.copyLink')}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}