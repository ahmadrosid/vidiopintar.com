import Link from "next/link";

export const linkClass = "text-[#e8ebef] underline decoration-[#65c9ad] underline-offset-4 hover:text-[#8de0c5]";
export const mutedLinkClass = "underline decoration-[#484a52] underline-offset-4 hover:text-white";

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
    <main className="relative min-h-screen overflow-x-clip bg-[#131518] font-mono text-[#c3c9d1]">
      {backdrop && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 overflow-hidden">
          {/* Never narrower than 900px so the art still covers the hero on phones. */}
          <div className="relative left-1/2 w-[max(100vw,900px)] -translate-x-1/2">{backdrop}</div>
          {/* Fade the art's bottom edge into the page. */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#131518]/50 via-[#131518]/10 to-[#131518]" />
          {/* Darken only behind the header and headline so the text reads while the art stays vivid. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_40%_25%,rgba(19,21,24,0.95)_0%,rgba(19,21,24,0.8)_45%,transparent_100%)]" />
        </div>
      )}
      <div className={`relative z-10 mx-auto w-full px-6 py-10 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
        <header className="flex items-baseline justify-between text-base">
          <Link href="/" className="text-[#e8ebef] hover:text-white">vidiopintar</Link>
          <span className="text-sm text-[#6f7782]">beta</span>
        </header>
        {children}
      </div>
    </main>
  );
}

export function PageTitle({ children, meta }: { children: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="mb-16 mt-16 sm:mt-24">
      <h1 className="font-display text-balance text-5xl font-extrabold leading-[0.95] tracking-tight text-[#e8ebef] [text-shadow:0_2px_24px_rgba(19,21,24,0.95),0_0_8px_rgba(19,21,24,0.8)] sm:text-7xl lg:text-8xl">{children}</h1>
      {meta && <p className="mt-6 text-sm text-[#6f7782]">{meta}</p>}
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
      className={`grid grid-cols-[minmax(0,1fr)] gap-4 border-t border-[#25272d] py-10 ${wide ? "md:gap-6" : "md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8"}`}
    >
      <h2 className="flex items-center gap-2.5 self-start font-display text-xl font-bold tracking-tight text-[#e8ebef]">
        {icon && <span className="text-[#65c9ad] [&>svg]:size-6">{icon}</span>}
        {label}
      </h2>
      <div className="min-w-0 space-y-3 text-base leading-8 text-[#c3c9d1] sm:text-lg">{children}</div>
    </section>
  );
}

export function Stat({ value, unit }: { value: string; unit: string }) {
  return (
    <div>
      <p className="font-display text-4xl font-extrabold leading-none tracking-tight text-[#e8ebef] sm:text-5xl">{value}</p>
      <p className="mt-2 text-sm text-[#8c95a1] sm:text-base">{unit}</p>
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
    <div className="border border-[#2a2d34] bg-[#0b0c0f]">
      <p className="border-b border-[#2a2d34] bg-[#16181c] px-4 py-2 text-xs text-[#8c95a1] sm:text-sm">{label}</p>
      <pre className="overflow-x-auto p-5 text-sm leading-7 text-[#e8ebef] sm:text-base">{children}</pre>
    </div>
  );
}
