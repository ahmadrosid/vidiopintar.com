import { getTranslations } from "next-intl/server";

type EmptyPageKey = "explore" | "library";

export async function EmptyStatePage({ page }: { page: EmptyPageKey }) {
  const t = await getTranslations(`emptyPages.${page}`);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-md text-muted-foreground">{t("description")}</p>
    </div>
  );
}
