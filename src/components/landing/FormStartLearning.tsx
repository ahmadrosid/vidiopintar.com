"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { extractVideoId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader, AlertTriangle, Crown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";
import { Input } from "../ui/input";

export function ButtonSubmitStartLearning({ isSubmitting }: { isSubmitting: boolean }) {
    return (
        <Button
            type="submit"
            size="icon"
            disabled={isSubmitting}
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 rounded-sm bg-slate-900 hover:bg-slate-900/90 active:scale-[0.975]"
        >
            {isSubmitting ? <Loader className="size-4 animate-spin dark:text-white" /> : <ArrowUp className="text-white size-4" />}
        </Button>
    );
}

export function FormStartLearning({ isFooter } : { isFooter?: boolean}) {
    const { data: session } = useSession();
    const router = useRouter();
    const tHero = useTranslations('heroForm');
    const t = useTranslations('limitDialog');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLimitDialog, setShowLimitDialog] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const videoUrl = formData.get("videoUrl") as string;

        if (!videoUrl) {
            toast.error(tHero('videoUrlRequired'));
            return;
        }

        if (!session) {
            const videoId = extractVideoId(videoUrl);
            if (!videoId) {
                toast.error(tHero('invalidYouTubeUrl'));
                return;
            }
            // Store the video ID for redirect after login/register
            sessionStorage.setItem("pendingVideoId", videoId);
            router.push(`/register?videoId=${videoId}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/video/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoUrl }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    const hasLimitError = result.errors.some((error: string) =>
                        error.includes('daily limit') || error.includes('upgrade')
                    );

                    if (hasLimitError) {
                        setShowLimitDialog(true);
                    } else {
                        result.errors.forEach((error: string) => {
                            toast.error(error);
                        });
                    }
                } else {
                    toast.error(result.error || 'An error occurred');
                }
                return;
            }

            // Success - redirect to video page
            if (result.videoId) {
                window.location.href = `/video/${result.videoId}`;
            } else {
                toast.success("Video submitted successfully!");
            }

        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {isFooter ? (
                <form className="relative isolate w-full max-w-[540px]" onSubmit={handleSubmit}>
                    <div className="w-full">
                        <Input
                            type="text"
                            name="videoUrl"
                            placeholder="Paste youtube url.."
                            className="pr-12 text-slate-950" // extra padding so text doesn't overlap button
                        />
                        <ButtonSubmitStartLearning isSubmitting={isSubmitting} />
                    </div>
                </form>
            ) : (
                <div className="absolute flex flex-col gap-6 p-8 min-h-[480px] justify-center items-center inset-0 w-full h-full backdrop-blur-[4px] bg-gradient-to-t from-black from-4% to-black/0 to-100%">
                    <div className="text-3xl -mt-12 text-center">
                        What do you want to learn today?
                    </div>
                    <form className="relative isolate w-full max-w-[540px]" onSubmit={handleSubmit}>
                        <div className="w-full">
                            <Input
                                type="text"
                                name="videoUrl"
                                placeholder="Paste youtube url.."
                                className="pr-12 text-slate-950" // extra padding so text doesn't overlap button
                            />
                            <ButtonSubmitStartLearning isSubmitting={isSubmitting} />
                        </div>
                    </form>
                </div>
            )}

            {/* Plan Limit Dialog */}
            <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <DialogTitle>{t('title')}</DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t('description')}
                        </p>

                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-sm">{t('premiumBenefits')}</span>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• {t('benefits.unlimited')}</li>
                                <li>• {t('benefits.ai')}</li>
                                <li>• {t('benefits.support')}</li>
                                <li>• {t('benefits.features')}</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowLimitDialog(false)}
                            className="flex-1"
                        >
                            {t('waitTomorrow')}
                        </Button>
                        <Link href="/profile/billing" className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                <Crown className="w-4 h-4 mr-2" />
                                {t('upgradeNow')}
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
