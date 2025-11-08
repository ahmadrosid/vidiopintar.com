import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NotesList } from "./notes-list";
import { getTranslations } from "next-intl/server";

export default async function NotesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const t = await getTranslations("profile");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tighter mb-2">
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

