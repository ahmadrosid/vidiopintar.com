import { getTranslations } from "next-intl/server";
import { VideoInputSection } from "@/components/video/video-input-section";

export async function HomeHero({ userId }: { userId: string }) {
  const t = await getTranslations("home");

  return (
    <section className="relative overflow-hidden pb-4 pt-6 md:pt-10">
      <div className="pointer-events-none absolute -right-8 top-0 hidden h-48 w-48 opacity-90 md:block lg:right-8 lg:h-56 lg:w-56">
        <PlayGraphic />
      </div>

      <div className="relative max-w-2xl space-y-2">
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

      <div className="relative mt-8 max-w-3xl">
        <VideoInputSection userId={userId} />
      </div>
    </section>
  );
}

function PlayGraphic() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className="h-full w-full">
      <ellipse
        cx="100"
        cy="168"
        rx="62"
        ry="12"
        className="fill-accent/20"
      />
      <circle cx="100" cy="96" r="58" className="fill-accent/10 stroke-accent/40" strokeWidth="2" />
      <circle cx="100" cy="96" r="42" className="fill-accent/20 stroke-accent/50" strokeWidth="1.5" />
      <path
        d="M88 74 L88 118 L128 96 Z"
        className="fill-accent"
      />
    </svg>
  );
}
