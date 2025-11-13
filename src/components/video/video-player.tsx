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
  const timeTrackingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { setPlayer, setReady, setCurrentTime } = useVideo()

  useEffect(() => {
    let isMounted = true

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer()
        return
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      if (existingScript) {
        // Script is loading, wait for it
        checkIntervalRef.current = setInterval(() => {
          if (window.YT && window.YT.Player) {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current)
              checkIntervalRef.current = null
            }
            initializePlayer()
          }
        }, 100)

        // Store the original callback if it exists
        const originalCallback = window.onYouTubeIframeAPIReady

        // Chain callbacks to avoid overwriting
        window.onYouTubeIframeAPIReady = () => {
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current)
            checkIntervalRef.current = null
          }
          if (originalCallback) {
            originalCallback()
          }
          initializePlayer()
        }
        return
      }

      // Store the original callback if it exists
      const originalCallback = window.onYouTubeIframeAPIReady

      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      // Chain callbacks to avoid overwriting
      window.onYouTubeIframeAPIReady = () => {
        if (originalCallback) {
          originalCallback()
        }
        initializePlayer()
      }
    }

    const initializePlayer = () => {
      if (!playerRef.current || !isMounted) return

      // Destroy existing player if it exists
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
        } catch (e) {
          // Ignore errors during cleanup
        }
        playerInstanceRef.current = null
      }

      // Clear any existing time tracking interval
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current)
        timeTrackingIntervalRef.current = null
      }

      try {
        const player = new window.YT.Player(playerRef.current, {
          videoId: videoId,
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return
              playerInstanceRef.current = event.target
              setPlayer(event.target)
              setReady(true)
              setIsLoading(false)
            },
            onStateChange: (event: any) => {
              if (!isMounted) return
              if (event.data === window.YT.PlayerState.PLAYING) {
                startTimeTracking(event.target)
              } else {
                // Clear interval when not playing
                if (timeTrackingIntervalRef.current) {
                  clearInterval(timeTrackingIntervalRef.current)
                  timeTrackingIntervalRef.current = null
                }
              }
            },
          },
        })
      } catch (error) {
        console.error('Error initializing YouTube player:', error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    const startTimeTracking = (player: any) => {
      // Clear any existing interval
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current)
      }

      const updateTime = () => {
        if (!isMounted || !player || !player.getCurrentTime) return
        try {
          setCurrentTime(player.getCurrentTime())
        } catch (e) {
          // Ignore errors
        }
      }

      timeTrackingIntervalRef.current = setInterval(updateTime, 1000)
    }

    loadYouTubeAPI()

    // Cleanup function
    return () => {
      isMounted = false

      // Clear check interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }

      // Clear time tracking interval
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current)
        timeTrackingIntervalRef.current = null
      }

      // Destroy player instance
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
        } catch (e) {
          // Ignore errors during cleanup
        }
        playerInstanceRef.current = null
      }

      // Reset state
      setReady(false)
      setPlayer(null)
    }
  }, [videoId, setPlayer, setReady, setCurrentTime])

  return (
    <div className="relative w-full aspect-video bg-black overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <Loader className="size-12 animate-spin text-spotify" />
        </div>
      )}
      <div ref={playerRef} className="w-full h-full" />
    </div>
  )
}

