import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/lib/db/repository';
import { NoteColor } from '@/lib/constants';

interface UseNotesOptions {
  userVideoId: number;
  enabled?: boolean;
}

interface UseNotesResult {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createNote: (timestamp: number, text: string, color: NoteColor) => Promise<Note | null>;
  updateNote: (id: number, updates: { text?: string; color?: NoteColor; timestamp?: number }) => Promise<Note | null>;
  deleteNote: (id: number) => Promise<boolean>;
}

export function useNotes({
  userVideoId,
  enabled = true
}: UseNotesOptions): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notes?userVideoId=${userVideoId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notes';
      setError(errorMessage);
      console.error('Error fetching notes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userVideoId, enabled]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(async (
    timestamp: number,
    text: string,
    color: NoteColor
  ): Promise<Note | null> => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userVideoId,
          timestamp,
          text,
          color,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const newNote = await response.json();
      setNotes((prev) => [...prev, newNote].sort((a, b) => a.timestamp - b.timestamp));
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      return null;
    }
  }, [userVideoId]);

  const updateNote = useCallback(async (
    id: number,
    updates: { text?: string; color?: NoteColor; timestamp?: number }
  ): Promise<Note | null> => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      setNotes((prev) =>
        prev
          .map((note) => (note.id === id ? updatedNote : note))
          .sort((a, b) => a.timestamp - b.timestamp)
      );
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      return null;
    }
  }, []);

  const deleteNote = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes((prev) => prev.filter((note) => note.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      return false;
    }
  }, []);

  return {
    notes,
    isLoading,
    error,
    refetch: fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}

