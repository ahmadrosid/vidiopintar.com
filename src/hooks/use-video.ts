import { useVideoStore } from '@/stores/video-store'

export const useVideo = () => {
  // Use selectors to ensure reactivity
  const currentTime = useVideoStore((state) => state.currentTime)
  const isReady = useVideoStore((state) => state.isReady)
  const player = useVideoStore((state) => state.player)
  
  // Actions don't need selectors, they're stable references
  const seekAndPlay = useVideoStore((state) => state.seekAndPlay)
  const seek = useVideoStore((state) => state.seek)
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime)
  const setReady = useVideoStore((state) => state.setReady)
  const setPlayer = useVideoStore((state) => state.setPlayer)
  const completePendingSeek = useVideoStore((state) => state.completePendingSeek)
  
  return {
    // State
    currentTime,
    isReady,
    player,
    
    // Actions
    seekAndPlay,
    seek,
    setCurrentTime,
    setReady,
    setPlayer,
    completePendingSeek,
  }
}