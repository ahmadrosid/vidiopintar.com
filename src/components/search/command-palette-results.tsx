"use client";

import { BookOpen, FileText, House } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchVideoHit = {
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
};

export type SearchNoteHit = {
  id: number;
  youtubeId: string;
  text: string;
  timestamp: number;
  videoTitle: string | null;
};

export type FlatItem =
  | { kind: "destination"; id: string; href: string; label: string }
  | { kind: "video"; id: string; href: string; title: string; subtitle: string }
  | {
      kind: "note";
      id: string;
      href: string;
      title: string;
      subtitle: string;
    };

type LabeledDestination = {
  href: string;
  label: string;
};

export function noteSnippet(text: string, max = 80) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function ResultOption({
  id,
  isActive,
  onActivate,
  onHighlight,
  children,
}: {
  id: string;
  isActive: boolean;
  onActivate: () => void;
  onHighlight: () => void;
  children: React.ReactNode;
}) {
  return (
    <li role="presentation">
      <button
        type="button"
        id={id}
        role="option"
        tabIndex={-1}
        aria-selected={isActive}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
          isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
        )}
        onMouseEnter={onHighlight}
        onClick={onActivate}
      >
        {children}
      </button>
    </li>
  );
}

export function DestinationResults({
  destinations,
  flatItems,
  activeIndex,
  heading,
  onActivate,
  onHighlight,
}: {
  destinations: LabeledDestination[];
  flatItems: FlatItem[];
  activeIndex: number;
  heading: string;
  onActivate: (item: FlatItem) => void;
  onHighlight: (index: number) => void;
}) {
  if (destinations.length === 0) return null;

  return (
    <section className="mb-2">
      <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">
        {heading}
      </h3>
      <ul className="space-y-0.5">
        {destinations.map((dest, index) => {
          const item = flatItems[index];
          if (!item) return null;
          return (
            <ResultOption
              key={dest.href}
              id={item.id}
              isActive={index === activeIndex}
              onHighlight={() => onHighlight(index)}
              onActivate={() => onActivate(item)}
            >
              <House className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{dest.label}</span>
            </ResultOption>
          );
        })}
      </ul>
    </section>
  );
}

export function VideoResults({
  videos,
  flatItems,
  offset,
  activeIndex,
  heading,
  onActivate,
  onHighlight,
}: {
  videos: SearchVideoHit[];
  flatItems: FlatItem[];
  offset: number;
  activeIndex: number;
  heading: string;
  onActivate: (item: FlatItem) => void;
  onHighlight: (index: number) => void;
}) {
  if (videos.length === 0) return null;

  return (
    <section className="mb-2">
      <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">
        {heading}
      </h3>
      <ul className="space-y-0.5">
        {videos.map((video, index) => {
          const itemIndex = offset + index;
          const item = flatItems[itemIndex];
          if (!item) return null;
          return (
            <ResultOption
              key={video.youtubeId}
              id={item.id}
              isActive={itemIndex === activeIndex}
              onHighlight={() => onHighlight(itemIndex)}
              onActivate={() => onActivate(item)}
            >
              <BookOpen className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{video.title}</span>
                {video.channelTitle ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {video.channelTitle}
                  </span>
                ) : null}
              </span>
            </ResultOption>
          );
        })}
      </ul>
    </section>
  );
}

export function NoteResults({
  notes,
  flatItems,
  offset,
  activeIndex,
  heading,
  onActivate,
  onHighlight,
}: {
  notes: SearchNoteHit[];
  flatItems: FlatItem[];
  offset: number;
  activeIndex: number;
  heading: string;
  onActivate: (item: FlatItem) => void;
  onHighlight: (index: number) => void;
}) {
  if (notes.length === 0) return null;

  return (
    <section>
      <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">
        {heading}
      </h3>
      <ul className="space-y-0.5">
        {notes.map((note, index) => {
          const itemIndex = offset + index;
          const item = flatItems[itemIndex];
          if (!item) return null;
          return (
            <ResultOption
              key={note.id}
              id={item.id}
              isActive={itemIndex === activeIndex}
              onHighlight={() => onHighlight(itemIndex)}
              onActivate={() => onActivate(item)}
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {noteSnippet(note.text)}
                </span>
                {note.videoTitle ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {note.videoTitle}
                  </span>
                ) : null}
              </span>
            </ResultOption>
          );
        })}
      </ul>
    </section>
  );
}
