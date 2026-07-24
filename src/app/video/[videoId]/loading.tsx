import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SUMMARY_LINE_WIDTHS = ['w-[92%]', 'w-[78%]', 'w-[85%]', 'w-[70%]', 'w-[88%]', 'w-[65%]', 'w-[80%]', 'w-[75%]'] as const;
const TRANSCRIPT_ROW_IDS = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12'] as const;
const QUICK_QUESTION_IDS = ['q1', 'q2', 'q3'] as const;
const CHAT_MESSAGE_IDS = ['m1', 'm2', 'm3'] as const;

export default function Loading() {
  return (
    <main className="flex flex-col h-dvh overflow-hidden bg-background relative">
      <div className="relative z-10 h-full min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-7 h-full min-h-0">
          {/* Left side - Video player and content */}
          <div className="lg:col-span-4 h-full min-h-0 overflow-y-auto scrollbar-none relative">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white dark:bg-black border-b">
              <div className="flex items-center p-4 gap-2">
                <Link
                  href="/home"
                  className="text-foreground hover:underline hover:text-accent transition-colors inline-flex gap-2 items-center"
                >
                  Home
                </Link>
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
                      {SUMMARY_LINE_WIDTHS.map((widthClass) => (
                        <div
                          key={widthClass}
                          className={`h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${widthClass}`}
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
                    {TRANSCRIPT_ROW_IDS.map((rowId) => (
                      <div key={rowId} className="flex gap-3">
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right side - Chat Interface */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden relative">
            <div className="border-l h-full min-h-0 overflow-hidden flex flex-col">
              {/* Chat Header */}
              <div className="border-b p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
              </div>

              {/* Quick Start Questions */}
              <div className="p-4 border-b flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40 mb-3" />
                <div className="space-y-2">
                  {QUICK_QUESTION_IDS.map((questionId) => (
                    <div
                      key={questionId}
                      className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="p-4 space-y-4">
                {CHAT_MESSAGE_IDS.map((messageId) => (
                  <div key={messageId} className="space-y-2">
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
