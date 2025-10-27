"use client";

import { authClient } from "@/lib/auth-client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function MagicLinkPage() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const searchParams = useSearchParams();
    const router = useRouter();
    const t = useTranslations('auth');

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get("token");

            if (!token) {
                setStatus("error");
                setErrorMessage(t('noTokenProvided'));
                return;
            }

            try {
                await authClient.magicLink.verify({
                    token,
                });
                setStatus("success");

                // Redirect to home or callback URL after a short delay
                setTimeout(() => {
                    router.push("/home");
                }, 1500);
            } catch (error) {
                console.error("Magic link verification failed:", error);
                setStatus("error");
                setErrorMessage(t('verificationFailed'));
            }
        };

        verifyToken();
    }, [searchParams, router, t]);

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <div className="max-w-92 m-auto h-fit w-full">
                <div className="p-6">
                    <div className="text-center">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="text-xl font-semibold">
                            Vidiopintar
                        </Link>

                        {status === "loading" && (
                            <div className="mt-8">
                                <LoadingSpinner text="" />
                                <h1 className="mb-1 mt-4 text-xl font-semibold">{t('verifyingEmail')}</h1>
                                <p className="text-muted-foreground">{t('pleaseWait')}</p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="mt-8">
                                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        className="w-8 h-8 text-green-600 dark:text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h1 className="mb-1 text-xl font-semibold">{t('verificationSuccess')}</h1>
                                <p className="text-muted-foreground">{t('redirecting')}</p>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="mt-8">
                                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        className="w-8 h-8 text-red-600 dark:text-red-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <h1 className="mb-1 text-xl font-semibold">{t('verificationError')}</h1>
                                <p className="text-muted-foreground mb-6">{errorMessage}</p>
                                <Link
                                    href="/login"
                                    className="text-primary underline hover:no-underline">
                                    {t('backToLogin')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
