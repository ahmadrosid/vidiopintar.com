"use client";

import { getCategoryBySlug } from "@/lib/data/categories";
import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";
import { notFound } from "next/navigation";
import { useState, useEffect, use } from "react";
import { VideoSearchResults } from "@/components/video/video-search-results";
import { searchVideos } from "@/lib/services/api";
import { RuntimeClient } from "@/lib/services/RuntimeClient";

export default function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(props.params);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const category = getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  useEffect(() => {
    async function loadVideos() {
      setIsLoading(true);
      try {
        if (!category?.searchQuery) {
          return;
        }
        const result = await RuntimeClient.runPromise(
          searchVideos(category.searchQuery)
        );
        setVideos(
          result.data.map((item) => ({
            ...item,
            thumbnails: [...item.thumbnails],
            author: { ...item.author },
          }))
        );
      } catch (error) {
        console.error("Search failed:", error);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadVideos();
  }, [category.searchQuery]);

  return (
    <>
      <HeroHeader />
      <main className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-[1328px] px-8 mx-auto mt-24">
          {/* Hero Section with Background Image */}
          <div className="relative h-64 overflow-hidden rounded-2xl mb-8">
            <img
              src={category.image}
              alt={category.label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/45">
              <div className="flex flex-col justify-center items-center h-full p-8">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter mb-4 text-white">
                  {category.label}
                </h1>
                <p className="text-xl lg:text-2xl text-white/90">
                  Discover videos about {category.label.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Video Cards Section */}
          <div className="w-full mb-8">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Loading videos...
                </p>
              </div>
            ) : videos.length > 0 ? (
              <VideoSearchResults results={videos} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No videos found for this category. Please try again later.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
