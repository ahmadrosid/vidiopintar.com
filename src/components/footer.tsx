import { ThemeSwitcher } from './ui/theme-switcher'

const links = [
    {
        title: 'Blog',
        href: '/blog',
    },
    {
        title: 'FAQ',
        href: '/faq',
    },
    {
        title: 'Changelog',
        href: '/changelogs',
    },
    {
        title: 'Privacy',
        href: '/privacy',
    },
    {
        title: 'Terms',
        href: '/terms',
    },
    {
        title: 'GitHub',
        href: 'https://github.com/ahmadrosid/vidiopintar.com',
    },
    {
        title: 'YouTube Help',
        href: 'https://support.google.com/youtube/',
    },
    {
        title: 'OpenAI Docs',
        href: 'https://platform.openai.com/docs',
    },
]

export function FooterSection() {
    return (
        <footer className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-6">
                <a
                    href="/"
                    aria-label="go home"
                    className="mx-auto block size-fit tracking-tight">
                    Vidiopintar
                </a>

                <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
                    {links.map((link, index) => (
                        <a
                            key={index}
                            href={link.href}
                            className="text-muted-foreground hover:text-primary block duration-150"
                            {...(link.href.startsWith('http')
                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                : {})}
                        >
                            <span>{link.title}</span>
                        </a>
                    ))}
                </div>
                <div className="flex justify-center my-6">
                    <ThemeSwitcher />
                </div>
                <span className="text-muted-foreground block text-center text-sm"> © {new Date().getFullYear()} Vidiopintar, All rights reserved</span>
            </div>
        </footer>
    )
}
