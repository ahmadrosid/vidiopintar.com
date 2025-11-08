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
  const { setPlayer, setReady, setCurrentTime } = useVideo()

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

      window.onYouTubeIframeAPIReady = initializePlayer
    }

    const initializePlayer = () => {
      if (!playerRef.current) return

      const player = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target)
            setReady(true)
            setIsLoading(false)
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              startTimeTracking(event.target)
            }
          },
        },
      })
    }

    const startTimeTracking = (player: any) => {
      const updateTime = () => {
        if (player && player.getCurrentTime) {
          setCurrentTime(player.getCurrentTime())
        }
      }

      const interval = setInterval(updateTime, 1000)
      return () => clearInterval(interval)
    }

    loadYouTubeAPI()
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

