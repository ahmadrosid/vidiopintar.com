"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
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

function ShareLinkCopyButton({
  slug,
  copyMessage,
  label,
}: {
  slug: string;
  copyMessage: string;
  label: string;
}) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/shared/${slug}`);
  }, [slug]);

  if (!shareUrl) return null;

  return (
    <CopyButton
      content={shareUrl}
      copyMessage={copyMessage}
      label={label}
    />
  );
}

export function SharedChatsList({ items }: SharedChatsListProps) {
  const t = useTranslations('profile');
  
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.slug}
          className="p-4 rounded-xs transition-colors duration-200 bg-card hover:bg-card/50 relative group"
        >
          <div className="flex gap-4">
            {item.thumbnailUrl ? (
              <Image
                src={item.thumbnailUrl}
                alt={item.title}
                width={128}
                height={80}
                className="w-32 h-20 object-cover rounded shrink-0"
              />
            ) : (
              <div className="w-32 h-20 rounded shrink-0 bg-muted" />
            )}
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
                <ShareLinkCopyButton
                  slug={item.slug}
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