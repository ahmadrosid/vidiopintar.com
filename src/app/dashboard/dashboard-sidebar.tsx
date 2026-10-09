"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { BookOpen01Icon, HistoryIcon, CreditCardIcon, Key01Icon, PlayIcon, Logout01Icon, ShieldKeyIcon, UserCircleIcon, UserSettings01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/dashboard", label: "Dashboard", Icon: Key01Icon },
  { href: "/dashboard/api-keys", label: "API key", Icon: ShieldKeyIcon },
  { href: "/dashboard/playground", label: "Playground", Icon: PlayIcon },
  { href: "/dashboard/logs", label: "Riwayat", Icon: HistoryIcon },
  { href: "/dashboard/billing", label: "Tagihan", Icon: CreditCardIcon },
  { href: "/panduan", label: "Panduan", Icon: BookOpen01Icon },
];

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

const itemBase = `flex min-h-11 shrink-0 cursor-pointer items-center gap-3 border-l-2 px-4 text-left text-sm transition-colors ${focusRing}`;

const itemIdle = "border-transparent text-site-text-muted hover:bg-site-header hover:text-site-text";

const itemActive = "border-site-accent bg-site-active text-site-text";

export function DashboardSidebar({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const navLinks = isAdmin ? [...links, { href: "/dashboard/admin", label: "Admin", Icon: UserSettings01Icon }] : links;
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();

  return (
    <aside className="border-b border-site-line-soft bg-site-deep md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
      <div className="flex items-baseline justify-between px-6 pt-6 pb-4 md:pt-10 md:pb-8">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-site-accent hover:text-site-accent-hover">
          vidiopintar
        </Link>
      </div>

      {/* Horizontal on phones, vertical in the sidebar from md up. */}
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
        {navLinks.map(({ href, label, Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${itemBase} ${active ? itemActive : itemIdle}`}
            >
              <HugeiconsIcon icon={Icon} className={`size-[18px] ${active ? "text-site-accent" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-site-line-soft px-2 py-4 md:block">
        <p className="truncate px-4 pb-3 text-xs text-site-text-faint" title={email}>{email}</p>
        <div className="px-4 pb-3"><ThemeToggle className="w-full" /></div>
        <button type="button" onClick={() => openUserProfile()} className={`${itemBase} ${itemIdle} w-full`}>
          <HugeiconsIcon icon={UserCircleIcon} className="size-[18px]" />
          Akun
        </button>
        <button type="button" onClick={() => signOut({ redirectUrl: "/" })} className={`${itemBase} ${itemIdle} w-full`}>
          <HugeiconsIcon icon={Logout01Icon} className="size-[18px]" />
          Keluar
        </button>
      </div>

      {/* Phones: account actions sit under the nav row. */}
      <div className="flex items-center gap-5 px-6 pb-4 text-sm md:hidden">
        <ThemeToggle className="cursor-pointer text-site-text-muted hover:text-site-text" />
        <span className="min-w-0 flex-1 truncate text-xs text-site-text-faint">{email}</span>
        <button type="button" onClick={() => openUserProfile()} className={`cursor-pointer text-site-text-muted hover:text-site-text ${focusRing}`}>
          Akun
        </button>
        <button type="button" onClick={() => signOut({ redirectUrl: "/" })} className={`cursor-pointer text-site-text-muted hover:text-site-text ${focusRing}`}>
          Keluar
        </button>
      </div>
    </aside>
  );
}

export function DashboardTitle({ children, meta }: { children: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-site-text sm:text-5xl">{children}</h1>
      {meta && <p className="mt-4 text-site-text-muted">{meta}</p>}
    </div>
  );
}
