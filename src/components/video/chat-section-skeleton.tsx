export function ChatSectionSkeleton() {
  return (
    <div className="border-l h-full min-h-0 overflow-hidden flex flex-col relative">
      {/* Chat Header */}
      <div className="border-b p-4 shrink-0">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
      </div>

      {/* Quick Start Questions */}
      <div className="p-4 border-b shrink-0">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              style={{ width: `${85 + Math.random() * 15}%` }}
            />
          ))}
        </div>
      </div>

      {/* Loading message area */}
      <div className="p-4 space-y-3 flex-1 min-h-0">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
      </div>

      {/* Chat Input */}
      <div className="border-t p-4 bg-white dark:bg-black shrink-0">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
}
