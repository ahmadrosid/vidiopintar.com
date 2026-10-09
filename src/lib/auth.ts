import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import type { User } from "@/lib/db/repository";

const clerkRateLimitErrorSchema = z.object({ status: z.literal(429) });

const sessionEmailSchema = z.object({ email: z.string() });

type SessionClaims = Awaited<ReturnType<typeof clerkAuth>>["sessionClaims"];

function getEmailFromSessionClaims(sessionClaims: SessionClaims): string | null {
  const parsed = sessionEmailSchema.safeParse(sessionClaims);

  return parsed.success ? parsed.data.email : null;
}

async function findUserByEmail(email: string): Promise<User | null> {
  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return existing ?? null;
}

async function findUserById(userId: string): Promise<User | null> {
  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return existing ?? null;
}

async function createUserFromClerkProfile(
  userId: string,
  clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
): Promise<User | null> {
  const email = clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) return null;

  const name =
    clerkUser.fullName ??
    ([clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      email.split("@")[0]);

  const image = clerkUser.imageUrl ?? null;

  const existingByEmail = await findUserByEmail(email);

  if (existingByEmail) return existingByEmail;

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

const syncUserFromClerk = cache(async (): Promise<User | null> => {
  const { userId, sessionClaims } = await clerkAuth();

  if (!userId) return null;

  const existingById = await findUserById(userId);

  if (existingById) return existingById;

  const emailFromClaims = getEmailFromSessionClaims(sessionClaims);

  if (emailFromClaims) {
    const existingByEmail = await findUserByEmail(emailFromClaims);

    if (existingByEmail) return existingByEmail;
  }

  try {
    const clerkUser = await currentUser();

    if (!clerkUser) return null;

    return createUserFromClerkProfile(userId, clerkUser);
  } catch (error) {
    if (clerkRateLimitErrorSchema.safeParse(error).success && emailFromClaims) {
      const existingByEmail = await findUserByEmail(emailFromClaims);

      if (existingByEmail) return existingByEmail;
    }

    throw error;
  }
});

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
