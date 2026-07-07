import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { User } from "@/lib/db/repository";

async function syncUserFromClerk(): Promise<User | null> {
  const { userId } = await clerkAuth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  const name =
    clerkUser.fullName ??
    ([clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      email.split("@")[0]);

  const image = clerkUser.imageUrl ?? null;

  const byEmail = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (byEmail[0]) return byEmail[0];

  const byId = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  if (byId[0]) return byId[0];

  const [created] = await db
    .insert(user)
    .values({
      id: userId,
      name,
      email,
      emailVerified: true,
      image,
    })
    .returning();

  return created;
}

export async function getOptionalUser(): Promise<User | null> {
  return syncUserFromClerk();
}

export async function getCurrentUser(): Promise<User> {
  const dbUser = await syncUserFromClerk();
  if (!dbUser) {
    redirect("/sign-in");
  }
  return dbUser;
}
