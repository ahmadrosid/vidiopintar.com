import Link from "next/link"
import CallToAction from "../common/call-to-action"

const footers = [
  {
    title: "Blog",
    href: "/blog",
    isExternal: false,
  },
  {
    title: "FAQ",
    href: "/faq",
    isExternal: false,
  },
  {
    title: "Changelogs",
    href: "/changelogs",
    isExternal: false,
  },
  {
    title: "Privacy",
    href: "/privacy",
    isExternal: false,
  },
  {
    title: "Terms",
    href: "/terms",
    isExternal: false,
  },
  {
    title: "GitHub",
    href: "https://github.com/ahmadrosid/vidiopintar.com",
    isExternal: true,
  },
  {
    title: "YouTube Help",
    href: "https://support.google.com/youtube/",
    isExternal: true,
  },
  {
    title: "OpenAI Docs",
    href: "https://platform.openai.com/docs",
    isExternal: true,
  },
]

export function Footer({ cta }: { cta?: boolean }) {
  return (
    <div>
      {cta && <CallToAction />}

      <div className="flex justify-between items-center w-full py-8 px-2 flex-col sm:flex-row gap-8">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-secondary-foreground">
          {footers.map((footer) => (
            <Link
              key={footer.title}
              href={footer.href}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              target={footer.isExternal ? "_blank" : "_self"}
              rel={footer.isExternal ? "noopener noreferrer" : undefined}
            >
              {footer.title}
            </Link>
          ))}
        </div>

        <div className="text-sm text-secondary-foreground">
          © {new Date().getFullYear()}{" "}
          <Link href="/" className="hover:text-white transition-colors cursor-pointer">
            vidiopintar
          </Link>
          , All rights reserved
        </div>
      </div>
    </div>
  )
}
