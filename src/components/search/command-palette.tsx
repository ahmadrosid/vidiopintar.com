"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, FileText, House, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  SEARCH_DESTINATIONS,
  type SearchDestination,
} from "@/components/search/search-destinations";

type SearchVideoHit = {
  youtubeId: string;
  title: string;
  channelTitle: string | null;
  thumbnailUrl: string | null;
};

type SearchNoteHit = {
  id: number;
  youtubeId: string;
  text: string;
  timestamp: number;
  videoTitle: string | null;
};

type FlatItem =
  | { kind: "destination"; id: string; href: string; label: string }
  | { kind: "video"; id: string; href: string; title: string; subtitle: string }
  | {
      kind: "note";
      id: string;
      href: string;
      title: string;
      subtitle: string;
    };

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function matchesQuery(label: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return label.toLowerCase().includes(q);
}

function noteSnippet(text: string, max = 80) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const tNav = useTranslations("navigation");
  const t = useTranslations("search");
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<SearchVideoHit[]>([]);
  const [notes, setNotes] = useState<SearchNoteHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const destinationLabels = useMemo(() => {
    return SEARCH_DESTINATIONS.map((dest: SearchDestination) => ({
      ...dest,
      label: tNav(dest.labelKey),
    }));
  }, [tNav]);

  const filteredDestinations = useMemo(() => {
    return destinationLabels.filter((dest) => matchesQuery(dest.label, query));
  }, [destinationLabels, query]);

  const flatItems = useMemo((): FlatItem[] => {
    const items: FlatItem[] = filteredDestinations.map((dest) => ({
      kind: "destination",
      id: `dest-${dest.href}`,
      href: dest.href,
      label: dest.label,
    }));

    if (query.trim().length < 2) return items;

    for (const video of videos) {
      items.push({
        kind: "video",
        id: `video-${video.youtubeId}`,
        href: `/video/${video.youtubeId}`,
        title: video.title,
        subtitle: video.channelTitle ?? "",
      });
    }

    for (const note of notes) {
      items.push({
        kind: "note",
        id: `note-${note.id}`,
        href: `/video/${note.youtubeId}?t=${Math.floor(note.timestamp)}`,
        title: noteSnippet(note.text),
        subtitle: note.videoTitle ?? "",
      });
    }

    return items;
  }, [filteredDestinations, notes, query, videos]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setVideos([]);
    setNotes([]);
    setError(null);
    setLoading(false);
    setActiveIndex(0);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, videos, notes, filteredDestinations.length]);

  useEffect(() => {
    const q = query.trim();
    if (!open || q.length < 2) {
      abortRef.current?.abort();
      setVideos([]);
      setNotes([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`search_failed_${res.status}`);
        }
        const data = (await res.json()) as {
          videos?: SearchVideoHit[];
          notes?: SearchNoteHit[];
        };
        if (controller.signal.aborted) return;
        setVideos(data.videos ?? []);
        setNotes(data.notes ?? []);
      } catch {
        if (controller.signal.aborted) return;
        setVideos([]);
        setNotes([]);
        setError(t("error"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, t]);

  const activateItem = useCallback(
    (item: FlatItem) => {
      onOpenChange(false);
      router.push(item.href);
    },
    [onOpenChange, router]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flatItems.length === 0) return;
      setActiveIndex((index) => (index + 1) % flatItems.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flatItems.length === 0) return;
      setActiveIndex(
        (index) => (index - 1 + flatItems.length) % flatItems.length
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = flatItems[activeIndex];
      if (item) activateItem(item);
    }
  };

  const showVideos = query.trim().length >= 2;
  const showNotes = query.trim().length >= 2;
  const isEmpty = flatItems.length === 0 && !loading;
  const activeId = flatItems[activeIndex]?.id;

  const videoOffset = filteredDestinations.length;
  const noteOffset = videoOffset + (showVideos ? videos.length : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[12%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>

        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={tNav("searchPlaceholder")}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
          />
          {loading ? (
            <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          ) : null}
        </div>

        <div
          id={listboxId}
          role="listbox"
          aria-label={t("title")}
          className="max-h-[min(60vh,24rem)] overflow-y-auto p-2"
        >
          {error ? (
            <p className="px-2 py-2 text-sm text-destructive">{error}</p>
          ) : null}

          {isEmpty ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              {t("empty")}
            </p>
          ) : null}

          {filteredDestinations.length > 0 ? (
            <section className="mb-2">
              <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">
                {t("destinations")}
              </h3>
              <ul className="space-y-0.5">
                {filteredDestinations.map((dest, index) => {
                  const itemIndex = index;
                  const item = flatItems[itemIndex];
                  const isActive = itemIndex === activeIndex;
                  return (
                    <li key={dest.href} role="presentation">
                      <button
                        type="button"
                        id={item?.id}
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        )}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        onClick={() => item && activateItem(item)}
                      >
                        <House className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{dest.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {showVideos && videos.length > 0 ? (
            <section className="mb-2">
              <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">
                {t("videos")}
              </h3>
              <ul className="space-y-0.5">
                {videos.map((video, index) => {
                  const itemIndex = videoOffset + index;
                  const item = flatItems[itemIndex];
                  const isActive = itemIndex === activeIndex;
                  return (
                    <li key={video.youtubeId} role="presentation">
                      <button
                        type="button"
                        id={item?.id}
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        )}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        onClick={() => item && activateItem(item)}
                      >
                        <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {video.title}
                          </span>
                          {video.channelTitle ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {video.channelTitle}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {showNotes && notes.length > 0 ? (
            <section>
              <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">
                {t("notes")}
              </h3>
              <ul className="space-y-0.5">
                {notes.map((note, index) => {
                  const itemIndex = noteOffset + index;
                  const item = flatItems[itemIndex];
                  const isActive = itemIndex === activeIndex;
                  return (
                    <li key={note.id} role="presentation">
                      <button
                        type="button"
                        id={item?.id}
                        role="option"
                        aria-selected={isActive}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        )}
                        onMouseEnter={() => setActiveIndex(itemIndex)}
                        onClick={() => item && activateItem(item)}
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
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
