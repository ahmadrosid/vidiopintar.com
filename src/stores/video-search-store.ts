import { create } from 'zustand'

export interface VideoResult {
  id: string;
  title: string;
  description: string;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  published: string;
  view_count: string;
  duration: string;
  author: {
    id: string;
    name: string;
  };
}

interface VideoSearchStore {
  results: VideoResult[];
  isLoading: boolean;
  setResults: (results: VideoResult[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useVideoSearchStore = create<VideoSearchStore>((set) => ({
  results: [],
  isLoading: false,
  setResults: (results) => set({ results }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))