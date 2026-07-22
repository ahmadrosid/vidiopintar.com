import { create } from 'zustand'

interface VideoStore {
  currentTime: number
  isReady: boolean
  player: any | null
  seekAndPlay: (timestamp: number) => boolean
  setCurrentTime: (time: number) => void
  setReady: (ready: boolean) => void
  setPlayer: (player: any) => void
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  currentTime: 0,
  isReady: false,
  player: null,

  seekAndPlay: (timestamp: number) => {
    const { player, isReady } = get()
    if (!player || !isReady) return false

    const seconds = Math.max(0, timestamp)

    try {
      player.seekTo(seconds, true)
      player.playVideo()
      return true
    } catch {
      // Ignore transient YouTube iframe API errors
      return false
    }
  },

  setCurrentTime: (time: number) => set({ currentTime: time }),
  setReady: (ready: boolean) => set({ isReady: ready }),
  setPlayer: (player: any) => set({ player }),
}))
