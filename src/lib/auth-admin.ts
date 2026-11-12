import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env/server";
import { redirect } from "next/navigation";

export function isUserAdmin(user: any): boolean {
  return user.email === env.ADMIN_MASTER_EMAIL;
}

export async function requireAdmin(): Promise<void> {
  const user = await getCurrentUser();

  if (!isUserAdmin(user)) {
    redirect("/dashboard");
  }
}
