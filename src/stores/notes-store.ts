import { create } from "zustand";

interface NotesStore {
  revisionByVideo: Record<number, number>;
  bumpNotes: (userVideoId: number) => void;
}

export const useNotesStore = create<NotesStore>((set) => ({
  revisionByVideo: {},
  bumpNotes: (userVideoId) =>
    set((state) => ({
      revisionByVideo: {
        ...state.revisionByVideo,
        [userVideoId]: (state.revisionByVideo[userVideoId] ?? 0) + 1,
      },
    })),
}));
