import Link from "next/link"
import CallToAction from "../common/call-to-action"

const footers = [
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
    title: "Github",
    href: "https://github.com/ahmadrosid/vidiopintar.com",
    isExternal: true,
  },
  {
    title: "Credits",
    href: "https://github.com/ahmadrosid/vidiopintar.com",
    isExternal: true,
  },
]

export function Footer({ cta }: { cta?: boolean }) {
  return (
    <div>
      {/* call to action */}
      {cta && <CallToAction />}

      {/* footer */}
      <div className="flex justify-between items-center w-full py-8 px-2 flex-col sm:flex-row gap-8">
        <div className="flex gap-6 text-sm text-secondary-foreground">
          {footers.map((footer) => (
            <Link
              key={footer.title}
              href={footer.href}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              target={footer.isExternal ? "_blank" : "_self"}
              rel={footer.isExternal ? "noopener noreferrer" : ""}
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
