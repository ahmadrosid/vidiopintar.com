import { VideoRepository } from "@/lib/db/repository";
import { VideoInputSection } from "@/components/video/video-input-section";
import { VideoListWithFilter } from "@/components/video/video-list-with-filter";
import { LastNotes } from "@/components/video/last-notes";
import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from "@/lib/geo/metadata";

export const metadata = buildPageMetadata({
  title: "Dashboard",
  description:
    "Your AI YouTube learning dashboard — summarize videos, chat with content, and organize knowledge.",
  path: "/home",
  noIndex: true,
})

export default async function Home() {
  const user = await getCurrentUser()
  const videos = await VideoRepository.getAllForUserWithDetails(user.id);
  const t = await getTranslations('home');
  
  return (
    <>
      <HeroHeader />
      <main className="relative min-h-screen overflow-hidden">
        <div className="relative z-10 max-w-[1328px] px-8 mx-auto">
          <div className="mt-24 mb-16 max-w-2xl mx-auto">
            <div className="px-6 py-14 text-center">
              <div className="mb-10 space-y-2">
                <h1 className="text-4xl font-bold tracking-tight text-[#1E293B] dark:text-foreground">
                  {t('title')}
                </h1>
                <p className="text-lg text-slate-500 dark:text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>
              <VideoInputSection userId={user.id} />
            </div>
          </div>
          <LastNotes limit={5} />
          <VideoListWithFilter videos={videos} />
        </div>
      </main>
      <FooterSection />
    </>
  );
}
