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
import { CircleNotch, MagnifyingGlass } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SEARCH_DESTINATIONS,
  type SearchDestination,
} from "@/components/search/search-destinations";
import {
  DestinationResults,
  NoteResults,
  VideoResults,
  type FlatItem,
  type SearchNoteHit,
  type SearchVideoHit,
} from "@/components/search/command-palette-results";
import { noteSnippet } from "@/components/search/note-snippet";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function matchesQuery(label: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return label.toLowerCase().includes(q);
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? <CommandPalettePanel onOpenChange={onOpenChange} /> : null}
    </Dialog>
  );
}

function CommandPalettePanel({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
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
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, videos, notes, filteredDestinations.length]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
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
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, t]);

  const activateItem = useCallback(
    (item: FlatItem) => {
      onOpenChange(false);
      router.push(item.href);
    },
    [onOpenChange, router]
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;

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

  const showResults = query.trim().length >= 2;
  const isEmpty = flatItems.length === 0 && !loading;
  const activeId = flatItems[activeIndex]?.id;

  useEffect(() => {
    if (!activeId) return;
    document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const videoOffset = filteredDestinations.length;
  const noteOffset = videoOffset + (showResults ? videos.length : 0);

  return (
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
        <MagnifyingGlass className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={tNav("searchPlaceholder")}
          aria-label={t("title")}
          className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          role="combobox"
          aria-expanded
          aria-controls={listboxId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {loading ? (
          <CircleNotch className="size-4 shrink-0 animate-spin text-muted-foreground" />
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

        <DestinationResults
          destinations={filteredDestinations}
          flatItems={flatItems}
          activeIndex={activeIndex}
          heading={t("destinations")}
          onActivate={activateItem}
          onHighlight={setActiveIndex}
        />

        {showResults ? (
          <VideoResults
            videos={videos}
            flatItems={flatItems}
            offset={videoOffset}
            activeIndex={activeIndex}
            heading={t("videos")}
            onActivate={activateItem}
            onHighlight={setActiveIndex}
          />
        ) : null}

        {showResults ? (
          <NoteResults
            notes={notes}
            flatItems={flatItems}
            offset={noteOffset}
            activeIndex={activeIndex}
            heading={t("notes")}
            onActivate={activateItem}
            onHighlight={setActiveIndex}
          />
        ) : null}
      </div>
    </DialogContent>
  );
}
