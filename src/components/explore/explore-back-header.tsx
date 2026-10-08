import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function ExploreBackHeader({ title, count, backLabel }: { title: string; count: string; backLabel: string }) {
  return (
    <div className="space-y-4">
      <Link href="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{count}</p>
      </header>
    </div>
  );
}
