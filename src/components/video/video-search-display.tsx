"use client";

import { useVideoSearchStore } from "@/stores/video-search-store";
import { VideoSearchResults } from "./video-search-results";

export function VideoSearchDisplay() {
  const { results } = useVideoSearchStore();

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="max-w-5xl px-6 mx-auto w-full mb-8">
      <h2 className="text-xl font-semibold text-left mb-6 tracking-tighter">Found {results.length} videos</h2>
      <VideoSearchResults results={results} />
    </div>
  );
}