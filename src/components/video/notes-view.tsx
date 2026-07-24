"use client";

import { useState, useRef } from "react";
import { useNotes } from "@/hooks/use-notes";
import { useVideo } from "@/hooks/use-video";
import { NoteColor } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Loader, StickyNote, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { NotesListItems } from "@/components/video/notes-list-items";
import { CreateNoteDialog, DeleteNoteDialog, EditNoteDialog } from "@/components/video/note-form-dialogs";

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
  const editingIdRef = useRef<number | null>(null);
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
    editingIdRef.current = id;
    setEditingText(text);
    setEditingColor(color);
    setEditingTimestamp(timestamp);
    setIsEditing(true);
  };

  const handleCloseEditDialog = () => {
    if (isSavingEdit) return;
    setIsEditing(false);
    editingIdRef.current = null;
    setEditingText("");
    setEditingColor("yellow");
    setEditingTimestamp(0);
  };

  const handleSaveEdit = async () => {
    if (!editingIdRef.current || !editingText.trim()) {
      toast.error(t("emptyNoteError"));
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await updateNote(editingIdRef.current, {
        text: editingText.trim(),
        color: editingColor,
        timestamp: editingTimestamp,
      });

      if (updated) {
        toast.success(t("noteUpdated"));
        setIsEditing(false);
        editingIdRef.current = null;
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

      <CreateNoteDialog
        open={isCreating}
        title={t("addNote")}
        timestampLabel={t("timestamp")}
        notePlaceholder={t("notePlaceholder")}
        colorLabel={t("color")}
        cancelLabel={t("cancel")}
        saveLabel={t("save")}
        currentTime={currentTime}
        noteText={noteText}
        selectedColor={selectedColor}
        isSaving={isCreatingNote}
        onOpenChange={(open) => !open && handleCloseCreateDialog()}
        onSave={handleCreateNote}
        onNoteTextChange={setNoteText}
        onSelectedColorChange={setSelectedColor}
      />

      <EditNoteDialog
        open={isEditing}
        title={t("addNote")}
        timestampLabel={t("timestamp")}
        notePlaceholder={t("notePlaceholder")}
        colorLabel={t("color")}
        cancelLabel={t("cancel")}
        saveLabel={t("save")}
        editingTimestamp={editingTimestamp}
        editingText={editingText}
        editingColor={editingColor}
        isSaving={isSavingEdit}
        onOpenChange={(open) => !open && handleCloseEditDialog()}
        onSave={handleSaveEdit}
        onEditingTextChange={setEditingText}
        onEditingColorChange={setEditingColor}
      />

      <DeleteNoteDialog
        open={deleteNoteId !== null}
        deleteConfirmLabel={t("deleteConfirm")}
        cancelLabel={t("cancel")}
        isDeleting={isDeletingNote}
        onOpenChange={(open) => !open && handleCancelDelete()}
        onConfirm={handleConfirmDelete}
      />

      <NotesListItems
        notes={notes}
        noNotesLabel={t("noNotes")}
        onJumpToTimestamp={handleJumpToTimestamp}
        onStartEdit={handleStartEdit}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  );
}
