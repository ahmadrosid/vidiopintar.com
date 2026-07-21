import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotesList } from "@/app/profile/notes/notes-list";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/geo/metadata";

export const metadata = buildPageMetadata({
  title: "Notes",
  description: "All your notes from videos you've watched.",
  path: "/notes",
  noIndex: true,
});

export default async function NotesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const t = await getTranslations("profile");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tighter">
          {t("profileSidebar.notes")}
        </h1>
        <p className="text-muted-foreground">
          All your notes from videos you've watched
        </p>
      </div>
      <NotesList userId={user.id} />
    </div>
  );
}
