import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";

export function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col gap-5 border border-site-line bg-site-panel p-5 sm:p-6">
      <p className="text-site-text">{feature} butuh paket berbayar.</p>
      <div>
        <Link
          href="/dashboard/billing"
          className="inline-flex min-h-10 cursor-pointer items-center gap-2 bg-site-accent-fill px-5 font-display text-base font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent"
        >
          Pilih paket
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
        </Link>
      </div>
    </div>
  );
}
