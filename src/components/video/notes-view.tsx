"use client";

import { useState } from "react";
import { useNotes } from "@/hooks/use-notes";
import { useVideo } from "@/hooks/use-video";
import { formatTime } from "@/lib/utils";
import { 
  NOTE_COLOR_OPTIONS, 
  NOTE_COLOR_CLASSES, 
  NOTE_COLOR_DOT_CLASSES,
  NoteColor 
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader, StickyNote, Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface NotesViewProps {
  userVideoId: number;
}

export function NotesView({ userVideoId }: NotesViewProps) {
  const t = useTranslations("video.notes");
  const { notes, isLoading, error, createNote, updateNote, deleteNote } = useNotes({ userVideoId });
  const { currentTime, seekAndPlay } = useVideo();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [selectedColor, setSelectedColor] = useState<NoteColor>("yellow");
  const [editingText, setEditingText] = useState("");
  const [editingColor, setEditingColor] = useState<NoteColor>("yellow");
  const [editingTimestamp, setEditingTimestamp] = useState<number>(0);

  const handleCreateNote = async () => {
    if (!noteText.trim()) {
      toast.error(t("emptyNoteError"));
      return;
    }

    const newNote = await createNote(currentTime, noteText.trim(), selectedColor);
    if (newNote) {
      toast.success(t("noteCreated"));
      setNoteText("");
      setSelectedColor("yellow");
      setIsCreating(false);
    } else {
      toast.error(t("createError"));
    }
  };

  const handleCloseCreateDialog = () => {
    setIsCreating(false);
    setNoteText("");
    setSelectedColor("yellow");
  };

  const handleStartEdit = (id: number, text: string, color: NoteColor, timestamp: number) => {
    setEditingId(id);
    setEditingText(text);
    setEditingColor(color);
    setEditingTimestamp(timestamp);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingText.trim()) {
      toast.error(t("emptyNoteError"));
      return;
    }

    const updated = await updateNote(editingId, {
      text: editingText.trim(),
      color: editingColor,
      timestamp: editingTimestamp,
    });

    if (updated) {
      toast.success(t("noteUpdated"));
      setEditingId(null);
    } else {
      toast.error(t("updateError"));
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (confirm(t("deleteConfirm"))) {
      const success = await deleteNote(id);
      if (success) {
        toast.success(t("noteDeleted"));
      } else {
        toast.error(t("deleteError"));
      }
    }
  };

  const handleJumpToTimestamp = (timestamp: number) => {
    seekAndPlay(timestamp);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 mt-8">
        <Loader className="size-7 animate-spin text-primary/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4 px-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm text-muted-foreground">
            {t("title")} ({notes.length})
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCreating(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("addNote")}
        </Button>
      </div>

      <Dialog open={isCreating} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addNote")}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("timestamp")}:</span>
              <span className="text-sm font-mono text-foreground">
                {formatTime(currentTime)}
              </span>
            </div>
            
            <Textarea
              placeholder={t("notePlaceholder")}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px] resize-none"
              autoFocus
            />

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{t("color")}:</span>
              <div className="flex gap-2">
                {NOTE_COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-7 h-7 rounded-full ${NOTE_COLOR_DOT_CLASSES[color]} border-2 ${
                      selectedColor === color ? "border-foreground scale-110" : "border-transparent"
                    } transition-all hover:scale-105`}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCreateDialog}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreateNote}
            >
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {notes.length === 0 ? (
        <div className="p-8 text-center">
          <StickyNote className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("noNotes")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-md border-l-4 ${NOTE_COLOR_CLASSES[note.color as NoteColor]} transition-all cursor-pointer hover:opacity-90`}
            >
              {editingId === note.id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t("timestamp")}:</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingTimestamp}
                      onChange={(e) => setEditingTimestamp(Number(e.target.value))}
                      className="w-24 h-7 text-xs"
                    />
                    <span className="text-xs font-mono text-muted-foreground">
                      ({formatTime(editingTimestamp)})
                    </span>
                  </div>
                  
                  <Textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="min-h-[60px] resize-none text-sm"
                    autoFocus
                  />

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t("color")}:</span>
                    <div className="flex gap-2">
                      {NOTE_COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditingColor(color)}
                          className={`w-5 h-5 rounded-full ${NOTE_COLOR_DOT_CLASSES[color]} border-2 ${
                            editingColor === color ? "border-foreground" : "border-transparent"
                          } transition-all`}
                          aria-label={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEdit}
                      size="sm"
                      className="flex-1"
                    >
                      {t("save")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => handleJumpToTimestamp(note.timestamp)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatTime(note.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(note.id, note.text, note.color as NoteColor, note.timestamp);
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

