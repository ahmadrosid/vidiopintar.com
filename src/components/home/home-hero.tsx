import { getTranslations } from "next-intl/server";
import { VideoInputSection } from "@/components/video/video-input-section";

export async function HomeHero({ userId }: { userId: string }) {
  const t = await getTranslations("home");

  return (
    <section className="pb-4 pt-6 md:pt-10">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm text-muted-foreground md:text-base">
          {t("welcome")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {t("title")}
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-8 max-w-3xl">
        <VideoInputSection userId={userId} />
      </div>
    </section>
  );
}
