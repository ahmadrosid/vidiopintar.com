import { db } from "@/lib/db";
import { schema } from "@/lib/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/lib/env/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const auth = betterAuth({
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    emailAndPassword: {
        enabled: true
    },
    database: drizzleAdapter(db, {
        provider: "pg",
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