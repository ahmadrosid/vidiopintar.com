"use client"

import { useState, useEffect, useRef } from "react"
import { Loader } from "lucide-react"
import { useVideo } from "@/hooks/use-video"

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface VideoPlayerProps {
  videoId: string
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const timeTrackingRef = useRef<NodeJS.Timeout | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { setPlayer, setReady, setCurrentTime, completePendingSeek, isReady } = useVideo()

  useEffect(() => {
    console.log('[VideoPlayer] Effect running, videoId:', videoId)

    const loadYouTubeAPI = () => {
      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        console.log('[VideoPlayer] YouTube API already loaded, initializing player')
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          initializePlayer()
        }, 0)
        return
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      if (existingScript) {
        console.log('[VideoPlayer] YouTube API script already exists, waiting for callback')
        // Script is loading, set up callback
        const previousCallback = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
          console.log('[VideoPlayer] onYouTubeIframeAPIReady callback fired')
          if (previousCallback) {
            console.log('[VideoPlayer] Calling previous callback')
            previousCallback()
          }
          initializePlayer()
        }
        return
      }

      // Load the script
      console.log('[VideoPlayer] Loading YouTube API script')
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      tag.defer = true
      
      // Handle script load errors
      tag.onerror = () => {
        console.error('[VideoPlayer] Failed to load YouTube API script')
        setIsLoading(false)
      }

      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      // Set up callback
      const previousCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        console.log('[VideoPlayer] onYouTubeIframeAPIReady callback fired')
        if (previousCallback) {
          console.log('[VideoPlayer] Calling previous callback')
          previousCallback()
        }
        initializePlayer()
      }
    }

    const initializePlayer = () => {
      console.log('[VideoPlayer] initializePlayer called')
      
      if (!playerRef.current) {
        console.error('[VideoPlayer] playerRef.current is null, cannot initialize')
        return
      }

      if (!window.YT || !window.YT.Player) {
        console.error('[VideoPlayer] YouTube API not available, cannot initialize')
        setIsLoading(false)
        return
      }

      // Clear any existing loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      if (playerInstanceRef.current?.destroy) {
        console.log('[VideoPlayer] Destroying existing player instance')
        try {
          playerInstanceRef.current.destroy()
        } catch (error) {
          console.warn('[VideoPlayer] Error destroying player:', error)
        }
        playerInstanceRef.current = null
      }

      // Set loading to true when initializing
      setIsLoading(true)
      console.log('[VideoPlayer] Creating new YouTube Player instance for videoId:', videoId)

      try {
        const player = new window.YT.Player(playerRef.current, {
          videoId,
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              console.log('[VideoPlayer] onReady event fired!', event)
              try {
                playerInstanceRef.current = event.target
                setPlayer(event.target)
                setReady(true)
                setIsLoading(false)
                // Clear timeout if onReady fires
                if (loadingTimeoutRef.current) {
                  clearTimeout(loadingTimeoutRef.current)
                  loadingTimeoutRef.current = null
                }
                console.log('[VideoPlayer] Player ready, loader hidden')
              } catch (error) {
                console.error('[VideoPlayer] Error in onReady handler:', error)
                setIsLoading(false)
              }
            },
            onStateChange: (event: any) => {
              const state = event.data
              const YT = window.YT
              
              console.log('[VideoPlayer] onStateChange:', state)
              
              // When video starts playing, start tracking time
              if (state === YT.PlayerState.PLAYING) {
                startTimeTracking(event.target)
              }
              
              // When video enters BUFFERING or PLAYING state after a seek, complete the pending seek
              // BUFFERING typically happens right after a seek, PLAYING happens when it starts playing
              if (state === YT.PlayerState.BUFFERING || state === YT.PlayerState.PLAYING) {
                // Small delay to ensure this is a seek completion, not just normal playback
                setTimeout(() => {
                  completePendingSeek()
                }, 50)
              }
            },
            onError: (event: any) => {
              // If there's an error, still hide the loader
              console.error('[VideoPlayer] YouTube player error:', event.data)
              setIsLoading(false)
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current)
                loadingTimeoutRef.current = null
              }
            },
          },
        })
        
        console.log('[VideoPlayer] Player instance created:', player)
        
        // Store player reference immediately for fallback check
        playerInstanceRef.current = player
      } catch (error) {
        console.error('[VideoPlayer] Error creating YouTube Player:', error)
        setIsLoading(false)
        return
      }

      // Fallback: Hide loader after 10 seconds if onReady doesn't fire
      // This handles edge cases where the event might not fire
      loadingTimeoutRef.current = setTimeout(() => {
        console.warn('[VideoPlayer] Fallback timeout triggered - onReady did not fire within 10 seconds')
        // Check if player is actually ready
        try {
          const player = playerInstanceRef.current
          if (player && typeof player.getPlayerState === 'function') {
            const state = player.getPlayerState()
            console.log('[VideoPlayer] Fallback check - player state:', state)
            // If we can get the state, the player is ready
            if (state !== undefined && state !== null) {
              console.log('[VideoPlayer] Player appears ready, hiding loader via fallback')
              setPlayer(player)
              setReady(true)
              setIsLoading(false)
            } else {
              console.warn('[VideoPlayer] Player state is invalid, hiding loader anyway')
              setIsLoading(false)
            }
          } else {
            console.warn('[VideoPlayer] Player instance not available or invalid, hiding loader')
            setIsLoading(false)
          }
        } catch (error) {
          // If we can't check state, assume it's ready and hide loader
          // This prevents infinite loading
          console.warn('[VideoPlayer] Could not verify player state, hiding loader:', error)
          setIsLoading(false)
        }
        loadingTimeoutRef.current = null
      }, 10000)
    }

    const startTimeTracking = (player: any) => {
      if (timeTrackingRef.current) {
        clearInterval(timeTrackingRef.current)
      }

      const updateTime = () => {
        if (player && player.getCurrentTime) {
          setCurrentTime(player.getCurrentTime())
        }
      }

      timeTrackingRef.current = setInterval(updateTime, 1000)
    }

    loadYouTubeAPI()

    return () => {
      if (timeTrackingRef.current) {
        clearInterval(timeTrackingRef.current)
        timeTrackingRef.current = null
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      if (playerInstanceRef.current?.destroy) {
        playerInstanceRef.current.destroy()
        playerInstanceRef.current = null
      }
      setPlayer(null)
      setReady(false)
      setIsLoading(true)
    }
  }, [videoId, setPlayer, setReady, setCurrentTime, completePendingSeek])

  // Sync loading state with ready state as a fallback
  useEffect(() => {
    if (isReady && isLoading) {
      setIsLoading(false)
    }
  }, [isReady, isLoading])

  return (
    <div 
      className="relative w-full aspect-video bg-black overflow-hidden"
      data-video-player
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <Loader className="size-12 animate-spin text-spotify" />
        </div>
      )}
      <div ref={playerRef} className="w-full h-full" />
    </div>
  )
}

