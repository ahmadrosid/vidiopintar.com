import Link from "next/link";

type SectionHeaderProps = {
  title: string;
  actionLabel: string;
  href?: string;
};

export function SectionHeader({ title, actionLabel, href }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="cursor-not-allowed text-sm font-medium text-muted-foreground opacity-70"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
