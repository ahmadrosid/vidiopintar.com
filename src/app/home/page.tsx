import { VideoRepository } from "@/lib/db/repository";
import { VideoInputSection } from "@/components/video/video-input-section";
import { VideoListWithFilter } from "@/components/video/video-list-with-filter";
import { LastNotes } from "@/components/video/last-notes";
import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";
import { VideoSearchDisplay } from "@/components/video/video-search-display";
import { getTranslations } from 'next-intl/server';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Vidiopintar",
  description: "Your AI-powered YouTube learning dashboard. Summarize videos, chat with content, and organize your knowledge.",
  alternates: {
    canonical: "/home",
  },
}

export default async function Home() {
  const user = await getCurrentUser()
  const videos = await VideoRepository.getAllForUserWithDetails(user.id);
  const t = await getTranslations('home');
  
  return (
    <>
      <HeroHeader />
      <main className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-[1328px] px-8 mx-auto">
          <div className="mt-24 mb-16 max-w-xl mx-auto">
            <div className="text-center mb-6 mt-8">
              <h1 className="text-4xl font-bold tracking-tighter">{t('title')}</h1>
              <p className="tracking-tight">{t('subtitle')}</p>
            </div>
            <VideoInputSection userId={user.id} />
          </div>
          <VideoSearchDisplay />
          <LastNotes limit={5} />
          <VideoListWithFilter videos={videos} />
        </div>
      </main>
      <FooterSection />
    </>
  );
}
