import Link from "next/link";

export const linkClass = "text-[#e8ebef] underline decoration-[#65c9ad] underline-offset-4 hover:text-[#8de0c5]";
export const mutedLinkClass = "underline decoration-[#484a52] underline-offset-4 hover:text-white";

export function SitePage({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#131518] font-mono text-[#c3c9d1]">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
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
      <h1 className="text-balance text-4xl leading-[1.1] tracking-tight text-[#e8ebef] sm:text-6xl">{children}</h1>
      {meta && <p className="mt-6 text-sm text-[#6f7782]">{meta}</p>}
    </div>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-3 border-t border-[#25272d] py-8 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8">
      <h2 className="text-sm uppercase tracking-widest text-[#6f7782]">{label}</h2>
      <div className="min-w-0 space-y-3 text-base leading-8 text-[#c3c9d1] sm:text-lg">{children}</div>
    </section>
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
