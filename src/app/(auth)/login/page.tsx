import { AuthForm } from '@/components/auth-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { isSmtpConfigured } from '@/lib/env/server'

interface LoginPageProps {
    searchParams: Promise<{ returnTo?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const t = await getTranslations('auth');
    const { returnTo } = await searchParams;
    const smtpEnabled = isSmtpConfigured();

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                action=""
                className="max-w-92 m-auto h-fit w-full">
                <div className="p-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            Vidiopintar
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">{t('loginTitle')}</h1>
                        <p>{t('loginSubtitle')}</p>
                    </div>

                    <AuthForm returnTo={returnTo} smtpEnabled={smtpEnabled} />

                    {/* <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <hr className="border-dashed" />
                        <span className="text-muted-foreground text-xs">Or continue With</span>
                        <hr className="border-dashed" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                            />
                        </div>

                        <Button className="w-full">Continue</Button>
                    </div> */}
                </div>

                <p className="text-accent-foreground text-left px-6 text-sm">
                    {t('noAccount')}
                    <Button
                        asChild
                        variant="link"
                        className="px-2">
                        <Link href="/register">{t('createAccount')}</Link>
                    </Button>
                </p>
            </form>
        </section>
    )
}
