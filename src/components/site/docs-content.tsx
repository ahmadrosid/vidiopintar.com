export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="border border-site-line bg-site-active px-1.5 py-0.5 text-[0.9em] text-site-text">
      {children}
    </code>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="group scroll-mt-8 font-display text-2xl font-bold tracking-tight text-site-text sm:text-3xl"
    >
      <a href={`#${id}`} className="hover:text-site-text">
        {children}
        <span className="ml-2 text-site-line-strong opacity-0 transition-opacity group-hover:opacity-100">
          #
        </span>
      </a>
    </h2>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 border-t border-site-line-soft pt-10">
      <H2 id={id}>{title}</H2>
      {children}
    </section>
  );
}
