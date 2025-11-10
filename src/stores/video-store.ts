import { create } from 'zustand'

interface VideoStore {
  currentTime: number
  isReady: boolean
  player: any | null
  pendingSeekTimestamp: number | null
  pendingSeekShouldPlay: boolean
  seekAndPlay: (timestamp: number, options?: { preservePlayerState?: boolean }) => void
  seek: (timestamp: number) => void
  setCurrentTime: (time: number) => void
  setReady: (ready: boolean) => void
  setPlayer: (player: any) => void
  completePendingSeek: () => void
}

export const useVideoStore = create<VideoStore>((set, get) => ({
  currentTime: 0,
  isReady: false,
  player: null,
  pendingSeekTimestamp: null,
  pendingSeekShouldPlay: false,
  
  seekAndPlay: (timestamp: number, options?: { preservePlayerState?: boolean }) => {
    const { player, isReady } = get()
    const preserveState = options?.preservePlayerState ?? false
    
    if (player && isReady) {
      try {
        let previousState: number | null = null
        let shouldPlay = true
        
        if (preserveState && typeof player.getPlayerState === 'function') {
          try {
            previousState = player.getPlayerState()
            const YT = window?.YT
            shouldPlay =
              previousState === YT?.PlayerState.PLAYING ||
              previousState === YT?.PlayerState.BUFFERING
          } catch (error) {
            console.warn('[VideoStore] Failed to get previous player state', error)
          }
        }

        // Set pending seek state - VideoPlayer will handle playing when seek completes
        set({ 
          pendingSeekTimestamp: timestamp,
          pendingSeekShouldPlay: shouldPlay
        })

        // Initiate the seek
        player.seekTo(timestamp, true)
        
        // Fallback: if no state change happens within 500ms, play anyway
        setTimeout(() => {
          const { pendingSeekTimestamp } = get()
          if (pendingSeekTimestamp === timestamp) {
            // Seek didn't complete via state change, handle it manually
            const { player: currentPlayer, pendingSeekShouldPlay } = get()
            if (currentPlayer && pendingSeekShouldPlay) {
              currentPlayer.playVideo()
            }
            set({ 
              pendingSeekTimestamp: null,
              pendingSeekShouldPlay: false
            })
          }
        }, 500)
      } catch (error) {
        console.error('[VideoStore] Error calling seekTo:', error)
        set({ 
          pendingSeekTimestamp: null,
          pendingSeekShouldPlay: false
        })
      }
    } else {
      // Try to wait a bit and retry if player is not ready yet
      if (!player || !isReady) {
        const checkInterval = setInterval(() => {
          const { player: currentPlayer, isReady: currentReady } = get()
          if (currentPlayer && currentReady) {
            clearInterval(checkInterval)
            try {
              currentPlayer.seekTo(timestamp, true)
              currentPlayer.playVideo()
            } catch (error) {
              console.error('[VideoStore] Error in retry:', error)
            }
          }
        }, 100)
        
        // Clear interval after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval)
        }, 5000)
      }
    }
  },
  
  completePendingSeek: () => {
    const { player, pendingSeekTimestamp, pendingSeekShouldPlay } = get()
    if (pendingSeekTimestamp !== null && player) {
      if (pendingSeekShouldPlay) {
        // Try to play, but don't worry if autoplay is blocked
        try {
          player.playVideo()
        } catch (error) {
          // Autoplay blocked - that's okay, video is already seeked
          // User can manually play if they want
        }
      }
      set({ 
        pendingSeekTimestamp: null,
        pendingSeekShouldPlay: false
      })
    }
  },
  
  seek: (timestamp: number) => {
    const { player, isReady } = get()
    if (player && isReady) {
      player.seekTo(timestamp, true)
    }
  },
  
  setCurrentTime: (time: number) => set({ currentTime: time }),
  setReady: (ready: boolean) => {
    set({ isReady: ready })
  },
  setPlayer: (player: any) => {
    set({ player })
  },
}))