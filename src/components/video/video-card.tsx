import Image from "next/image";
import Link from "next/link";

type VideoCardProps = {
  youtubeId: string;
  title: string;
  channelTitle?: string | null;
  thumbnailUrl?: string | null;
  meta?: string | null;
  layout?: "grid" | "list";
};

export function VideoCard({
  youtubeId,
  title,
  channelTitle,
  thumbnailUrl,
  meta,
  layout = "grid",
}: VideoCardProps) {
  if (layout === "list") {
    return (
      <Link
        href={`/video/${youtubeId}`}
        className="flex gap-4 rounded-xl border border-white/10 bg-card p-3 transition-colors hover:border-white/20 hover:bg-card/80"
      >
        <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-48">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-1 py-0.5">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {title}
          </h3>
          {channelTitle ? (
            <p className="truncate text-xs text-muted-foreground">
              {channelTitle}
            </p>
          ) : null}
          {meta ? (
            <p className="truncate text-xs text-muted-foreground/80">{meta}</p>
          ) : null}
        </div>
      </Link>
    );
  }

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
          {meta ? (
            <p className="truncate text-xs text-muted-foreground/80">{meta}</p>
          ) : null}
        </div>
      </Link>
    </div>
  );
}
