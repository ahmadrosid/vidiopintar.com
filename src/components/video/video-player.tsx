"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Loader } from "lucide-react"
import { useVideo } from "@/hooks/use-video"
import { useVideoStore } from "@/stores/video-store"

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
  const lastAppliedTRef = useRef<string | null>(null)
  const { setPlayer, setReady, setCurrentTime } = useVideo()
  const searchParams = useSearchParams()
  const tParam = searchParams.get("t")
  const isReady = useVideoStore((state) => state.isReady)
  const seekAndPlay = useVideoStore((state) => state.seekAndPlay)

  useEffect(() => {
    lastAppliedTRef.current = null
  }, [videoId])

  useEffect(() => {
    if (!isReady) {
      lastAppliedTRef.current = null
      return
    }
    if (tParam == null) return

    const seconds = Number.parseInt(tParam, 10)
    if (!Number.isFinite(seconds) || seconds < 0) return
    if (lastAppliedTRef.current === tParam) return

    if (seekAndPlay(seconds)) {
      lastAppliedTRef.current = tParam
    }
  }, [isReady, tParam, seekAndPlay])

  useEffect(() => {
    let isMounted = true

    const releaseStoreIfOwned = () => {
      if (useVideoStore.getState().player === playerInstanceRef.current) {
        setReady(false)
        setPlayer(null)
      }
    }

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer()
        return
      }

      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      if (existingScript) {
        checkIntervalRef.current = setInterval(() => {
          if (window.YT && window.YT.Player) {
            if (checkIntervalRef.current) {
              clearInterval(checkIntervalRef.current)
              checkIntervalRef.current = null
            }
            initializePlayer()
          }
        }, 100)

        const originalCallback = window.onYouTubeIframeAPIReady

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

      const originalCallback = window.onYouTubeIframeAPIReady

      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        if (originalCallback) {
          originalCallback()
        }
        initializePlayer()
      }
    }

    const initializePlayer = () => {
      if (!playerRef.current || !isMounted) return

      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy()
        } catch {
          // Ignore errors during cleanup
        }
        playerInstanceRef.current = null
      }

      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current)
        timeTrackingIntervalRef.current = null
      }

      try {
        new window.YT.Player(playerRef.current, {
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
              } else if (timeTrackingIntervalRef.current) {
                clearInterval(timeTrackingIntervalRef.current)
                timeTrackingIntervalRef.current = null
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
      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current)
      }

      const updateTime = () => {
        if (!isMounted || !player || !player.getCurrentTime) return
        if (useVideoStore.getState().player !== player) return
        try {
          setCurrentTime(player.getCurrentTime())
        } catch {
          // Ignore errors
        }
      }

      timeTrackingIntervalRef.current = setInterval(updateTime, 1000)
    }

    loadYouTubeAPI()

    return () => {
      isMounted = false

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        checkIntervalRef.current = null
      }

      if (timeTrackingIntervalRef.current) {
        clearInterval(timeTrackingIntervalRef.current)
        timeTrackingIntervalRef.current = null
      }

      if (playerInstanceRef.current) {
        releaseStoreIfOwned()
        try {
          playerInstanceRef.current.destroy()
        } catch {
          // Ignore errors during cleanup
        }
        playerInstanceRef.current = null
      }
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
