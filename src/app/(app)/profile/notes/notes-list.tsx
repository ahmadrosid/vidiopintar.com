"use client";

import { useMemo, useState } from "react";
import { Note } from "@phosphor-icons/react";
import { formatTime } from "@/lib/utils";
import { NOTE_COLOR_BORDER_CLASSES, NoteColor } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export type NoteWithVideo = {
  id: number;
  userId: string;
  userVideoId: number;
  timestamp: number;
  text: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  youtubeId: string;
  videoTitle: string;
  channelTitle: string | null;
};

interface NotesListProps {
  notes: NoteWithVideo[];
}

export function NotesList({ notes }: NotesListProps) {
  const t = useTranslations("profile");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const uniqueVideos = useMemo(() => {
    const videos = notes.map((note) => ({
      youtubeId: note.youtubeId,
      title: note.videoTitle,
      channelTitle: note.channelTitle,
    }));
    const unique = Array.from(
      new Map(videos.map((v) => [v.youtubeId, v])).values()
    );
    return unique.sort((a, b) =>
      (a.title || "").localeCompare(b.title || "")
    );
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (!selectedVideoId) return notes;
    return notes.filter((note) => note.youtubeId === selectedVideoId);
  }, [notes, selectedVideoId]);

  if (notes.length === 0) {
    return (
      <div className="p-12 text-center">
        <Note className="mx-auto mb-4 size-16 text-muted-foreground" />
        <p className="text-muted-foreground">{t("notes.noNotes")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {uniqueVideos.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 overflow-x-auto py-2">
          <Button
            variant={selectedVideoId === null ? "default" : "secondary"}
            size="sm"
            onClick={() => setSelectedVideoId(null)}
            className="rounded-full px-4 py-2 text-sm whitespace-nowrap"
          >
            {t("notes.allVideos")}
          </Button>
          {uniqueVideos.map((video) => (
            <Button
              key={video.youtubeId}
              variant={selectedVideoId === video.youtubeId ? "default" : "secondary"}
              size="sm"
              onClick={() =>
                setSelectedVideoId(
                  selectedVideoId === video.youtubeId ? null : video.youtubeId
                )
              }
              className="rounded-full px-4 py-2 text-sm whitespace-nowrap"
            >
              {video.title}
            </Button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filteredNotes.map((note) => {
          const videoUrl = `/video/${note.youtubeId}?t=${Math.floor(note.timestamp)}`;
          return (
            <Link
              key={note.id}
              href={videoUrl}
              className="block"
            >
              <div
                className="p-4 rounded-xs transition-colors transition-transform duration-200 cursor-pointer bg-card hover:bg-card/50 relative group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                        {note.videoTitle}
                      </h3>
                      {note.channelTitle && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {note.channelTitle}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {formatTime(note.timestamp)}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <div
                      className={`w-1 rounded-full shrink-0 ${
                        NOTE_COLOR_BORDER_CLASSES[note.color as NoteColor]
                      }`}
                    />
                    <p className="flex-1 text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                      {note.text}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
