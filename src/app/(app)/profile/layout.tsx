import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">{children}</div>
  );
}
