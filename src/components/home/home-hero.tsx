import { getTranslations } from "next-intl/server";
import { VideoInputSection } from "@/components/video/video-input-section";

export async function HomeHero({ userId }: { userId: string }) {
  const t = await getTranslations("home");

  return (
    <section className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#1a2332] to-[#0f1419] px-5 py-8 shadow-sm md:px-10 md:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-zinc-400 md:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-8 w-full">
          <VideoInputSection userId={userId} />
        </div>
      </div>
    </section>
  );
}
