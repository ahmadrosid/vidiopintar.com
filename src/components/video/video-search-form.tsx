"use client";

import { useState } from "react";
import { PromptInput, PromptInputTextarea, PromptInputActions } from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { searchVideos } from "@/lib/services/api";
import { useVideoSearchStore } from "@/stores/video-search-store";
import { RuntimeClient } from "@/lib/services/RuntimeClient";

export function VideoSearchForm() {
  const [query, setQuery] = useState("");
  const { setResults, isLoading, setIsLoading } = useVideoSearchStore();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const result = await RuntimeClient.runPromise(searchVideos(query));
      setResults(result.data.map(item => ({
        ...item,
        thumbnails: [...item.thumbnails],
        author: { ...item.author },
        published: item.published || '',
        duration: item.duration || ''
      })));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PromptInput
      value={query}
      onValueChange={setQuery}
      onSubmit={handleSearch}
    >
      <PromptInputTextarea
        placeholder="Search for videos..."
        className="bg-transparent!"
        required
      />
      <PromptInputActions className="justify-end pt-2">
        <Button onClick={handleSearch} type="submit" disabled={isLoading} className="rounded-xl cursor-pointer">
          {isLoading ? <Loader className="size-4 animate-spin" /> : "Search"}
        </Button>
      </PromptInputActions>
    </PromptInput>
  );
}