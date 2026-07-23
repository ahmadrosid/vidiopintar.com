import { getTranslations } from "next-intl/server";
import { VideoInputSection } from "@/components/video/video-input-section";

export async function HomeHero({ userId }: { userId: string }) {
  const t = await getTranslations("home");

  return (
    <section className="rounded-2xl border border-border bg-card px-5 py-8 md:px-10 md:py-12">
      <div className="flex w-full flex-col items-start text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-8 w-full">
          <VideoInputSection userId={userId} />
        </div>
      </div>
    </section>
  );
}
