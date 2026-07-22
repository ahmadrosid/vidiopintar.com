import Image from "next/image";
import Link from "next/link";
import type { YoutubeSearchChannel } from "@/lib/youtube/search";

type ChannelResultCardProps = {
  channel: YoutubeSearchChannel;
  subscriberLabel: string;
  avatarSize?: "sm" | "md";
};

const AVATAR_SIZES = {
  sm: { className: "size-12", sizes: "48px" },
  md: { className: "size-16 sm:size-20", sizes: "80px" },
} as const;

export function ChannelAvatar({
  channel,
  size = "sm",
}: {
  channel: YoutubeSearchChannel;
  size?: "sm" | "md";
}) {
  const avatar = AVATAR_SIZES[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-muted ${avatar.className}`}
    >
      {channel.thumbnailUrl ? (
        <Image
          src={channel.thumbnailUrl}
          alt={channel.title}
          fill
          className="object-cover"
          sizes={avatar.sizes}
        />
      ) : null}
    </div>
  );
}

export function ChannelResultCard({
  channel,
  subscriberLabel,
  avatarSize = "sm",
}: ChannelResultCardProps) {
  return (
    <Link
      href={`/explore/channels/${channel.channelId}`}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-card p-3 transition-colors hover:border-white/20 hover:bg-card/80"
    >
      <ChannelAvatar channel={channel} size={avatarSize} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {channel.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {subscriberLabel}
        </p>
      </div>
    </Link>
  );
}
