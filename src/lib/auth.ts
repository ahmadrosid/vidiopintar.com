import { db } from "@/lib/db";
import { schema } from "@/lib/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true
    },
    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema,
    }),
    plugins: [nextCookies()]
});

export async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        redirect("/login");
        throw new Error("Not authenticated");
    }

    return session.user;
}