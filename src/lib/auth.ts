import { db } from "@/lib/db";
import { schema } from "@/lib/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { env, isSmtpConfigured } from "@/lib/env/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTransporter } from "@/lib/email";

// Build plugins array conditionally
const plugins = [nextCookies()];

// Only add magicLink plugin if SMTP is configured
if (isSmtpConfigured()) {
    plugins.push(
        magicLink({
            sendMagicLink: async ({ email, url, token }) => {
                const transporter = getTransporter();
                await transporter.sendMail({
                    from: env.SMTP_FROM!,
                    to: email,
                    subject: "Sign in to VidioPintar",
                    text: `Click the link below to sign in to your account:\n\n${url}\n\nThis link expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.\n\n---\nVidioPintar`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Sign in to VidioPintar</h2>
                            <p>Click the link below to sign in to your account:</p>
                            <p>
                                <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">
                                    Sign In
                                </a>
                            </p>
                            <p style="color: #666; font-size: 14px;">This link expires in 5 minutes.</p>
                            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="color: #999; font-size: 12px;">VidioPintar</p>
                        </div>
                    `,
                });
            },
            expiresIn: 300, // 5 minutes
        })
    );
}

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
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
    plugins
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