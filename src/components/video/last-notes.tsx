"use client";

import { useState, useEffect } from "react";
import { formatTime } from "@/lib/utils";
import { NOTE_COLOR_BORDER_CLASSES, NoteColor } from "@/lib/constants";
import Link from "next/link";
import { useTranslations } from "next-intl";

type NoteWithVideo = {
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

interface LastNotesProps {
  limit?: number;
}

export function LastNotes({ limit = 3 }: LastNotesProps) {
  const t = useTranslations("home");
  const [notes, setNotes] = useState<NoteWithVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/notes/all");
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        const data = await response.json();
        // Get the most recent notes (already sorted by createdAt desc from API)
        setNotes(data.slice(0, limit));
      } catch (err) {
        console.error("Error fetching notes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [limit]);

  if (isLoading || notes.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-xl font-semibold tracking-tighter mb-6">
        {t("lastNotes")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => {
          const videoUrl = `/video/${note.youtubeId}?t=${Math.floor(note.timestamp)}`;
          return (
            <Link
              key={note.id}
              href={videoUrl}
              className="block"
            >
              <div
                className="p-4 rounded-xs transition-all duration-200 cursor-pointer bg-card hover:bg-card/50 relative group h-full"
              >
                <div className="flex flex-col gap-2">
                  {/* Video info */}
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

                  {/* Note content */}
                  <div className="flex gap-3">
                    <div
                      className={`w-1 rounded-full shrink-0 ${
                        NOTE_COLOR_BORDER_CLASSES[note.color as NoteColor]
                      }`}
                    />
                    <p className="flex-1 text-sm text-foreground whitespace-pre-wrap line-clamp-2">
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

