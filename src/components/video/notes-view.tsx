"use client";

import { useState } from "react";
import { useNotes } from "@/hooks/use-notes";
import { useVideo } from "@/hooks/use-video";
import { formatTime } from "@/lib/utils";
import {
  NOTE_COLOR_OPTIONS,
  NOTE_COLOR_DOT_CLASSES,
  NoteColor,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, StickyNote, Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const NOTE_COLOR_BORDER_CLASSES: Record<NoteColor, string> = {
  yellow: "bg-yellow-300 dark:bg-yellow-700",
  blue: "bg-blue-300 dark:bg-blue-700",
  green: "bg-green-300 dark:bg-green-700",
  red: "bg-red-300 dark:bg-red-700",
  purple: "bg-purple-300 dark:bg-purple-700",
};

interface NotesViewProps {
  userVideoId: number;
}

export function NotesView({ userVideoId }: NotesViewProps) {
  const t = useTranslations("video.notes");
  const { notes, isLoading, error, createNote, updateNote, deleteNote } =
    useNotes({ userVideoId });
  const { currentTime, seekAndPlay } = useVideo();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null);
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

    setIsCreatingNote(true);
    try {
      const newNote = await createNote(
        currentTime,
        noteText.trim(),
        selectedColor
      );
      if (newNote) {
        toast.success(t("noteCreated"));
        setNoteText("");
        setSelectedColor("yellow");
        setIsCreating(false);
      } else {
        toast.error(t("createError"));
      }
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleCloseCreateDialog = () => {
    if (isCreatingNote) return;
    setIsCreating(false);
    setNoteText("");
    setSelectedColor("yellow");
  };

  const handleStartEdit = (
    id: number,
    text: string,
    color: NoteColor,
    timestamp: number
  ) => {
    setEditingId(id);
    setEditingText(text);
    setEditingColor(color);
    setEditingTimestamp(timestamp);
    setIsEditing(true);
  };

  const handleCloseEditDialog = () => {
    if (isSavingEdit) return;
    setIsEditing(false);
    setEditingId(null);
    setEditingText("");
    setEditingColor("yellow");
    setEditingTimestamp(0);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingText.trim()) {
      toast.error(t("emptyNoteError"));
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await updateNote(editingId, {
        text: editingText.trim(),
        color: editingColor,
        timestamp: editingTimestamp,
      });

      if (updated) {
        toast.success(t("noteUpdated"));
        setIsEditing(false);
        setEditingId(null);
      } else {
        toast.error(t("updateError"));
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteNote = (id: number) => {
    setDeleteNoteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteNoteId) return;

    setIsDeletingNote(true);
    try {
      const success = await deleteNote(deleteNoteId);
      if (success) {
        toast.success(t("noteDeleted"));
        setDeleteNoteId(null);
      } else {
        toast.error(t("deleteError"));
      }
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteNoteId(null);
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
    <div className="space-y-4 py-4 px-1">
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
          className="gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t("addNote")}
        </Button>
      </div>

      <Dialog open={isCreating} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("addNote")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("timestamp")}:
              </span>
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
              <span className="text-sm text-muted-foreground">
                {t("color")}:
              </span>
              <Select
                value={selectedColor}
                onValueChange={(value) => setSelectedColor(value as NoteColor)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full ${NOTE_COLOR_DOT_CLASSES[color]}`}
                        />
                        <span className="capitalize">{color}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCreateDialog}
              disabled={isCreatingNote}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreateNote}
              className="cursor-pointer"
              disabled={isCreatingNote}
            >
              {isCreatingNote && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("addNote")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("timestamp")}:
              </span>
              <span className="text-sm font-mono text-foreground">
                {formatTime(editingTimestamp)}
              </span>
            </div>

            <Textarea
              placeholder={t("notePlaceholder")}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="min-h-[100px] resize-none"
              autoFocus
            />

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {t("color")}:
              </span>
              <Select
                value={editingColor}
                onValueChange={(value) =>
                  setEditingColor(value as NoteColor)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_COLOR_OPTIONS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full ${NOTE_COLOR_DOT_CLASSES[color]}`}
                        />
                        <span className="capitalize">{color}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseEditDialog}
              disabled={isSavingEdit}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="cursor-pointer"
              disabled={isSavingEdit}
            >
              {isSavingEdit && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteNoteId !== null} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeletingNote}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingNote}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeletingNote && (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {notes.length === 0 ? (
        <div className="p-8 text-center">
          <StickyNote className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t("noNotes")}</p>
        </div>
      ) : (
        <div className="h-full max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 mr-1 rounded-xs transition-all duration-200 cursor-pointer active:scale-[0.975] bg-card hover:bg-card/50 relative group`}
                onClick={() => handleJumpToTimestamp(note.timestamp)}
              >
                <div className="flex">
                  <div
                    className={`w-1 h-full absolute left-0 top-0 bottom-0 rounded-l-xs ${
                      NOTE_COLOR_BORDER_CLASSES[note.color as NoteColor]
                    }`}
                  />
                  <span className="text-muted-foreground font-mono mr-3 whitespace-nowrap transition-colors">
                    {formatTime(note.timestamp)}
                  </span>
                  <span className="flex-1 text-foreground whitespace-pre-wrap">
                    {note.text}
                  </span>
                </div>
                <div
                  className="flex gap-1 shrink-0 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(
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
                      handleDeleteNote(note.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
