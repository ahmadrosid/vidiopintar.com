import { Card } from "@/components/ui/card";
import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";

function LoadingSkeleton() {
  return (
    <Card className="rounded-2xl overflow-hidden dark:border-white/10 shadow-none">
      <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4 mb-4" />
      </div>
    </Card>
  );
}

export default function Loading() {
  return (
    <>
      <HeroHeader />
      <main className="relative min-h-screen p-6 overflow-hidden">
        <div className="relative z-10 max-w-[1328px] px-8 mx-auto mt-24">
          {/* Hero Section with Background Image */}
          <div className="relative h-64 overflow-hidden rounded-2xl mb-8">
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="absolute inset-0 bg-black/35">
              <div className="flex flex-col justify-center items-center h-full p-8 text-center">
                <div className="h-14 lg:h-16 bg-white/20 rounded animate-pulse mb-4 max-w-md mx-auto" />
                <div className="h-7 lg:h-8 bg-white/20 rounded animate-pulse max-w-lg mx-auto" />
              </div>
            </div>
          </div>

          {/* Video Cards Section */}
          <div className="w-full mb-8">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}