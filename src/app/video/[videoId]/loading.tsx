import { ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Loading() {
  return (
    <main className="flex flex-col min-h-screen bg-melody-gradient relative">
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 h-screen">
          {/* Left side - Video player and content */}
          <div className="lg:col-span-4 h-full overflow-y-auto scrollbar-none relative">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white dark:bg-black border-b">
              <div className="flex items-center p-4 gap-2">
                <a
                  href="/home"
                  className="text-foreground hover:underline hover:text-melody transition-colors inline-flex gap-2 items-center"
                >
                  Home
                </a>
                <ChevronRight className="size-5 text-muted-foreground" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1 max-w-md" />
              </div>
            </div>

            {/* Video Player Skeleton */}
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />

            {/* Tabs and Content */}
            <div className="p-3">
              <Tabs defaultValue="summary" className="w-full">
                <TabsContent
                  value="summary"
                  className="h-full overflow-y-auto p-0 m-0"
                >
                  <div className="p-4 space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                    <div className="space-y-2 mt-6">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                          style={{ width: `${Math.random() * 40 + 60}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent
                  value="transcript"
                  className="h-full overflow-y-auto p-0 m-0"
                >
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent
                  value="comments"
                  className="h-full overflow-y-auto p-0 m-0"
                >
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right side - Chat Interface */}
          <div className="lg:col-span-3 flex flex-col h-full md:h-auto relative">
            <div className="border-l h-full">
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
              </div>

              {/* Quick Start Questions */}
              <div className="p-4 border-b flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40 mb-3" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="border-t p-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
