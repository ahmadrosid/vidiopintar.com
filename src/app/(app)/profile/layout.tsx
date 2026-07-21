import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileContent } from "./profile-content";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return <ProfileContent user={user}>{children}</ProfileContent>;
}
