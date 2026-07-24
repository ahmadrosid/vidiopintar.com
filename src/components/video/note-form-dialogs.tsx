"use client";

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
import {
  NOTE_COLOR_OPTIONS,
  NOTE_COLOR_DOT_CLASSES,
  NoteColor,
} from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import { Loader } from "lucide-react";

function NoteColorSelect({
  value,
  onValueChange,
  colorLabel,
}: {
  value: NoteColor;
  onValueChange: (color: NoteColor) => void;
  colorLabel: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{colorLabel}:</span>
      <Select value={value} onValueChange={(next) => onValueChange(next as NoteColor)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {NOTE_COLOR_OPTIONS.map((color) => (
            <SelectItem key={color} value={color}>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${NOTE_COLOR_DOT_CLASSES[color]}`} />
                <span className="capitalize">{color}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CreateNoteDialog({
  open,
  title,
  timestampLabel,
  notePlaceholder,
  colorLabel,
  cancelLabel,
  saveLabel,
  currentTime,
  noteText,
  selectedColor,
  isSaving,
  onOpenChange,
  onSave,
  onNoteTextChange,
  onSelectedColorChange,
}: {
  open: boolean;
  title: string;
  timestampLabel: string;
  notePlaceholder: string;
  colorLabel: string;
  cancelLabel: string;
  saveLabel: string;
  currentTime: number;
  noteText: string;
  selectedColor: NoteColor;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onNoteTextChange: (value: string) => void;
  onSelectedColorChange: (color: NoteColor) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{timestampLabel}:</span>
            <span className="text-sm font-mono text-foreground">{formatTime(currentTime)}</span>
          </div>

          <Textarea
            placeholder={notePlaceholder}
            value={noteText}
            onChange={(e) => onNoteTextChange(e.target.value)}
            className="min-h-[100px] resize-none"
            autoFocus
          />

          <NoteColorSelect
            value={selectedColor}
            onValueChange={onSelectedColorChange}
            colorLabel={colorLabel}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {cancelLabel}
          </Button>
          <Button onClick={onSave} className="cursor-pointer" disabled={isSaving}>
            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditNoteDialog({
  open,
  title,
  timestampLabel,
  notePlaceholder,
  colorLabel,
  cancelLabel,
  saveLabel,
  editingTimestamp,
  editingText,
  editingColor,
  isSaving,
  onOpenChange,
  onSave,
  onEditingTextChange,
  onEditingColorChange,
}: {
  open: boolean;
  title: string;
  timestampLabel: string;
  notePlaceholder: string;
  colorLabel: string;
  cancelLabel: string;
  saveLabel: string;
  editingTimestamp: number;
  editingText: string;
  editingColor: NoteColor;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onEditingTextChange: (value: string) => void;
  onEditingColorChange: (color: NoteColor) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{timestampLabel}:</span>
            <span className="text-sm font-mono text-foreground">{formatTime(editingTimestamp)}</span>
          </div>

          <Textarea
            placeholder={notePlaceholder}
            value={editingText}
            onChange={(e) => onEditingTextChange(e.target.value)}
            className="min-h-[100px] resize-none"
            autoFocus
          />

          <NoteColorSelect
            value={editingColor}
            onValueChange={onEditingColorChange}
            colorLabel={colorLabel}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {cancelLabel}
          </Button>
          <Button onClick={onSave} className="cursor-pointer" disabled={isSaving}>
            {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteNoteDialog({
  open,
  deleteConfirmLabel,
  cancelLabel,
  isDeleting,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  deleteConfirmLabel: string;
  cancelLabel: string;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Note</AlertDialogTitle>
          <AlertDialogDescription>{deleteConfirmLabel}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isDeleting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
