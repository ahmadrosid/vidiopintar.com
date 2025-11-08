import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";
import { VideoSearchSkeletonGrid } from "@/components/video/video-search-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <HeroHeader />
      <main className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-[1328px] px-8 mx-auto mt-24">
          {/* Hero Section with Background Image */}
          <div className="relative h-64 overflow-hidden rounded-xs mb-8">
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 bg-black/45">
              <div className="flex flex-col justify-center items-center h-full p-8">
                <Skeleton className="h-14 lg:h-16 mb-4 max-w-md mx-auto w-full bg-white/20" />
                <Skeleton className="h-7 lg:h-8 max-w-lg mx-auto w-3/4 bg-white/20" />
              </div>
            </div>
          </div>

          {/* Video Cards Section */}
          <div className="w-full mb-8">
            <VideoSearchSkeletonGrid />
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}