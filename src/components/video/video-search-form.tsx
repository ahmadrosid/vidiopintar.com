"use client";

import { useState } from "react";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { searchVideos } from "@/lib/services/api";
import { useVideoSearchStore } from "@/stores/video-search-store";
import { useTranslations } from "next-intl";

export function VideoSearchForm() {
  const [query, setQuery] = useState("");
  const { setResults, isLoading, setIsLoading } = useVideoSearchStore();
  const t = useTranslations("video");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const result = await searchVideos(query);
      setResults(
        result.data.map((item) => ({
          ...item,
          thumbnails: [...item.thumbnails],
          author: { ...item.author },
          published: item.published || "",
          duration: item.duration || "",
        }))
      );
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PromptInput value={query} onValueChange={setQuery} onSubmit={handleSearch}>
      <PromptInputTextarea
        placeholder={t("searchPlaceholder")}
        className="bg-transparent!"
        required
      />
      <PromptInputActions className="justify-end pt-2">
        <Button
          onClick={handleSearch}
          type="submit"
          disabled={isLoading}
          className="rounded-xl text-black cursor-pointer bg-gradient-to-r from-[#00D4DD] to-[#00AAB6] hover:from-[#00AAB6] hover:to-[#008B94] shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? <Loader className="size-4 animate-spin" /> : t("search")}
        </Button>
      </PromptInputActions>
    </PromptInput>
  );
}
