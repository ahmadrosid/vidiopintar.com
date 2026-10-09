import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export const linkClass = "text-site-text underline decoration-site-accent underline-offset-4 hover:text-site-accent-hover";
export const mutedLinkClass = "underline decoration-site-line-strong underline-offset-4 hover:text-site-text";

export function SitePage({
  children,
  backdrop,
  wide,
}: {
  children: React.ReactNode;
  backdrop?: React.ReactNode;
  // Wider container for pages with a sidebar, like the docs.
  wide?: boolean;
}) {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-site-bg font-mono text-site-text-2">
      {backdrop && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden">
          {/* Never narrower than 900px so the art still covers the hero on phones. */}
          <div className="relative left-1/2 w-[max(100vw,900px)] -translate-x-1/2">{backdrop}</div>
          {/* Fade the art's bottom edge into the page. */}
          <div className="absolute inset-0 bg-gradient-to-b from-site-bg/50 via-site-bg/10 to-site-bg" />
          {/* Darken only behind the header and headline so the text reads while the art stays vivid. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_40%_25%,rgb(var(--site-bg-rgb)/0.95)_0%,rgb(var(--site-bg-rgb)/0.8)_45%,transparent_100%)]" />
        </div>
      )}
      <div className={`relative z-10 mx-auto w-full px-6 py-10 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
        <header className="flex items-baseline justify-between text-base">
          <Link href="/" className="text-site-text hover:text-site-text">vidiopintar</Link>
          <div className="flex items-center gap-6">
            <Link href="/panduan" className="text-sm text-site-text-muted hover:text-site-text">Panduan</Link>
            <ThemeToggle className="inline-flex items-center text-site-text-muted hover:text-site-text" />
          </div>
        </header>
        {children}
        <SiteFooter />
      </div>
    </main>
  );
}

const footerLinks = [
  { href: "/panduan", label: "Panduan" },
  { href: "/privacy", label: "Privasi" },
  { href: "/terms", label: "Ketentuan" },
  { href: "/api/health", label: "Status" },
  { href: "mailto:support@vidiopintar.com", label: "Dukungan" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-site-line-soft pt-8 text-sm text-site-text-muted">
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
        {footerLinks.map((link) =>
          link.href.startsWith("http") || link.href.startsWith("mailto:") || link.href.startsWith("/api/") ? (
            <a key={link.href} href={link.href} className="hover:text-site-text">{link.label}</a>
          ) : (
            <Link key={link.href} href={link.href} className="hover:text-site-text">{link.label}</Link>
          ),
        )}
      </nav>
      <p className="mt-6 text-xs text-site-text-faint">© {new Date().getFullYear()} Vidiopintar. MCP transkrip YouTube untuk AI Agent.</p>
    </footer>
  );
}

export function PageTitle({ children, meta }: { children: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="mb-16 mt-16 sm:mt-24">
      <h1 className="font-display text-balance text-5xl font-extrabold leading-[0.95] tracking-tight text-site-text [text-shadow:0_2px_24px_rgb(var(--site-bg-rgb)/0.95),0_0_8px_rgb(var(--site-bg-rgb)/0.8)] sm:text-7xl lg:text-8xl">{children}</h1>
      {meta && <p className="mt-6 text-sm text-site-text-faint">{meta}</p>}
    </div>
  );
}

export function Row({
  label,
  icon,
  wide,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  // Stack the heading above full-width content instead of using the side label column.
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`grid grid-cols-[minmax(0,1fr)] gap-4 border-t border-site-line-soft py-10 ${wide ? "md:gap-6" : "md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8"}`}
    >
      <h2 className="flex items-center gap-2.5 self-start font-display text-xl font-bold tracking-tight text-site-text">
        {icon && <span className="text-site-accent [&>svg]:size-6">{icon}</span>}
        {label}
      </h2>
      <div className="min-w-0 space-y-3 text-base leading-8 text-site-text-2 sm:text-lg">{children}</div>
    </section>
  );
}

export function Stat({ value, unit }: { value: string; unit: string }) {
  return (
    <div>
      <p className="font-display text-4xl font-extrabold leading-none tracking-tight text-site-text sm:text-5xl">{value}</p>
      <p className="mt-2 text-sm text-site-text-muted sm:text-base">{unit}</p>
    </div>
  );
}

export function SeeAlso({ links }: { links: { href: string; label: string }[] }) {
  return (
    <Row label="Lihat juga">
      <p>
        {links.map((link, index) => (
          <span key={link.href}>
            {index > 0 && ", "}
            {link.href.startsWith("mailto:") ? (
              <a href={link.href} className={mutedLinkClass}>{link.label}</a>
            ) : (
              <Link href={link.href} className={mutedLinkClass}>{link.label}</Link>
            )}
          </span>
        ))}
      </p>
    </Row>
  );
}

export function CodeBlock({ label, children }: { label: string; children: string }) {
  return (
    <div className="border border-site-line bg-site-panel">
      <p className="border-b border-site-line bg-site-header px-4 py-2 text-xs text-site-text-muted sm:text-sm">{label}</p>
      <pre className="overflow-x-auto p-5 text-sm leading-7 text-site-text sm:text-base">{children}</pre>
    </div>
  );
}
