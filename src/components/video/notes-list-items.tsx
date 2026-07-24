"use client";

import { Button } from "@/components/ui/button";
import { NOTE_COLOR_BORDER_CLASSES, NoteColor } from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import { Edit2, StickyNote, Trash2 } from "lucide-react";

interface NoteItem {
  id: number;
  text: string;
  color: string;
  timestamp: number;
}

interface NotesListItemsProps {
  notes: NoteItem[];
  noNotesLabel: string;
  onJumpToTimestamp: (timestamp: number) => void;
  onStartEdit: (id: number, text: string, color: NoteColor, timestamp: number) => void;
  onDeleteNote: (id: number) => void;
}

export function NotesListItems({
  notes,
  noNotesLabel,
  onJumpToTimestamp,
  onStartEdit,
  onDeleteNote,
}: NotesListItemsProps) {
  if (notes.length === 0) {
    return (
      <div className="p-8 text-center">
        <StickyNote className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{noNotesLabel}</p>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-1">
        {notes.map((note) => (
          <div
            key={note.id}
            role="button"
            tabIndex={0}
            className="p-3 mr-1 rounded-xs transition-colors transition-transform duration-200 cursor-pointer active:scale-[0.975] bg-card hover:bg-card/50 relative"
            onClick={() => onJumpToTimestamp(note.timestamp)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onJumpToTimestamp(note.timestamp);
              }
            }}
          >
            <div
              className={`w-1 absolute left-0 top-0 bottom-0 rounded-l-xs ${
                NOTE_COLOR_BORDER_CLASSES[note.color as NoteColor]
              }`}
            />
            <div className="flex gap-3">
              <span className="text-muted-foreground font-mono whitespace-nowrap shrink-0">
                {formatTime(note.timestamp)}
              </span>
              <span className="flex-1 min-w-0 text-foreground whitespace-pre-wrap">
                {note.text}
              </span>
            </div>
            <div
              className="flex justify-end gap-1 mt-2 pt-2 border-t border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEdit(
                    note.id,
                    note.text,
                    note.color as NoteColor,
                    note.timestamp
                  );
                }}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
