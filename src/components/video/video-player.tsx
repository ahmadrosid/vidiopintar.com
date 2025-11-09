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
  const { setPlayer, setReady, setCurrentTime, completePendingSeek } = useVideo()

  useEffect(() => {

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer()
        return
      }

      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      const previousCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback()
        initializePlayer()
      }
    }

    const initializePlayer = () => {
      if (!playerRef.current) {
        return
      }

      if (playerInstanceRef.current?.destroy) {
        playerInstanceRef.current.destroy()
        playerInstanceRef.current = null
      }

      const player = new window.YT.Player(playerRef.current, {
        videoId,
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            playerInstanceRef.current = event.target
            setPlayer(event.target)
            setReady(true)
            setIsLoading(false)
          },
          onStateChange: (event: any) => {
            const state = event.data
            const YT = window.YT
            
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
        },
      })
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
      if (playerInstanceRef.current?.destroy) {
        playerInstanceRef.current.destroy()
        playerInstanceRef.current = null
      }
      setPlayer(null)
      setReady(false)
      setIsLoading(true)
    }
  }, [videoId, setPlayer, setReady, setCurrentTime, completePendingSeek])

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

