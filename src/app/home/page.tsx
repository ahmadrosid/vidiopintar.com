import { VideoRepository } from "@/lib/db/repository";
import { VideoInputSection } from "@/components/video/video-input-section";
import { Card } from "@/components/ui/card";
import { VideoListWithFilter } from "@/components/video/video-list-with-filter";
import { categories } from "@/lib/data/categories";
import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth";
import { VideoSearchDisplay } from "@/components/video/video-search-display";
import { getTranslations } from 'next-intl/server';

import Link from "next/link";

function CategoryCard({ image, label, slug }: { image: string; label: string; slug: string }) {
  return (
    <Link href={`/category/${slug}`}>
      <Card className="rounded-xs overflow-hidden relative cursor-pointer group hover:shadow-lg transition-shadow border-none">
        <img src={image} className="w-full h-20 object-cover group-hover:scale-105 transition-all" />
        <div className="absolute inset-0 bg-black/35">
          <div className="p-4 flex justify-center items-center h-full">
            <p className="text-2xl font-semibold tracking-tighter text-white">{label}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
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
          <div className="w-full mb-8">
            <h2 className="text-xl font-semibold text-left mb-6 tracking-tighter">{t('chooseTopics')}</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, idx) => (
                <CategoryCard
                  key={idx}
                  image={category.image}
                  label={category.label}
                  slug={category.slug}
                />
              ))}
            </div>
          </div>
          <VideoListWithFilter videos={videos} />
        </div>
      </main>
      <FooterSection />
    </>
  );
}
