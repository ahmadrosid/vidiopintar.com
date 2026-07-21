import Image from "next/image";
import Link from "next/link";

type VideoCardProps = {
  youtubeId: string;
  title: string;
  channelTitle?: string | null;
  thumbnailUrl?: string | null;
};

export function VideoCard({
  youtubeId,
  title,
  channelTitle,
  thumbnailUrl,
}: VideoCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-card transition-colors hover:border-white/20 hover:bg-card/80">
      <Link href={`/video/${youtubeId}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : null}
        </div>

        <div className="space-y-1 px-3 py-3">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {title}
          </h3>
          {channelTitle ? (
            <p className="truncate text-xs text-muted-foreground">
              {channelTitle}
            </p>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
