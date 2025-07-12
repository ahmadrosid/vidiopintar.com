"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import FuzzySearch from "fuzzy-search"
import { Search, X } from "lucide-react"
import { useState } from "react"
import { useVideo } from "@/hooks/use-video"
import { formatTime } from "@/lib/utils"

interface TranscriptSegment {
  start: string | number
  end: string | number
  text: string
  isChapterStart?: boolean
}

interface TranscriptViewProps {
  transcript: {
    segments: TranscriptSegment[]
  }
}

export function TranscriptView({ transcript }: TranscriptViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const { seekAndPlay, currentTime } = useVideo()

  const parseTimeToSeconds = (time: string | number): number => {
    if (typeof time === 'number') return time
    
    // Parse HH:mm:ss format to seconds
    const parts = time.split(':').map(Number)
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts
      return hours * 3600 + minutes * 60 + seconds
    }
    return 0
  }

  const isCurrentSegment = (segment: TranscriptSegment) => {
    const startSeconds = parseTimeToSeconds(segment.start)
    const endSeconds = parseTimeToSeconds(segment.end)
    return currentTime >= startSeconds && currentTime <= endSeconds
  }

  const filteredSegments = searchQuery
    ? (() => {
        const searcher = new FuzzySearch(transcript.segments, ["text"], {
          caseSensitive: false,
          sort: true,
        })
        const result = searcher.search(searchQuery)
        return result
      })()
    : transcript.segments

  return (
    <div className="space-y-4 py-4 px-1">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          placeholder="Search transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            onClick={() => setSearchQuery("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-full max-h-[320px] overflow-y-auto">
        <div className="space-y-1">
          {filteredSegments.map((segment, index) => (
            <div
              key={index}
              className={`p-3 mr-1 rounded-xl transition-all duration-200 hover:bg-secondary/40 cursor-pointer ${
                searchQuery && segment.text.toLowerCase().includes(searchQuery.toLowerCase())
                  ? "bg-melody/10 border bg-accent border-melody/20"
                  : ""
              } ${
                isCurrentSegment(segment)
                  ? "bg-primary/10 border border-primary/20"
                  : ""
              }`}
              onClick={() => seekAndPlay(parseTimeToSeconds(segment.start))}
            >
              <div className="flex">
                <span className="text-muted-foreground font-mono mr-3 whitespace-nowrap hover:text-primary transition-colors">
                  {typeof segment.start === 'string' ? segment.start : formatTime(segment.start)}
                </span>
                <span className="flex-1">{segment.text}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
