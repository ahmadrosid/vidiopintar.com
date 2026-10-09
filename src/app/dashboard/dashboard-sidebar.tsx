"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { BookOpen, ClockCounterClockwise, CreditCard, Key, Play, SignOut, UserCircle } from "@phosphor-icons/react";

const links = [
  { href: "/dashboard", label: "Dashboard", Icon: Key },
  { href: "/dashboard/playground", label: "Playground", Icon: Play },
  { href: "/dashboard/logs", label: "Log", Icon: ClockCounterClockwise },
  { href: "/dashboard/billing", label: "Tagihan", Icon: CreditCard },
  { href: "/panduan", label: "Panduan", Icon: BookOpen },
];

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e28fab]";
const itemBase = `flex min-h-11 shrink-0 cursor-pointer items-center gap-3 border-l-2 px-4 text-left text-sm transition-colors ${focusRing}`;
const itemIdle = "border-transparent text-[#8c95a1] hover:bg-[#16181c] hover:text-[#e8ebef]";
const itemActive = "border-[#e28fab] bg-[#1b1d22] text-[#e8ebef]";

export function DashboardSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();

  return (
    <aside className="border-b border-[#25272d] bg-[#0f1114] md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
      <div className="flex items-baseline justify-between px-6 pt-6 pb-4 md:pt-10 md:pb-8">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-[#e28fab] hover:text-[#f2b2c4]">
          vidiopintar
        </Link>
      </div>

      {/* Horizontal on phones, vertical in the sidebar from md up. */}
      <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`${itemBase} ${active ? itemActive : itemIdle}`}
            >
              <Icon weight={active ? "fill" : "regular"} className={`size-[18px] ${active ? "text-[#e28fab]" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-[#25272d] px-2 py-4 md:block">
        <p className="truncate px-4 pb-3 text-xs text-[#6f7782]" title={email}>{email}</p>
        <button type="button" onClick={() => openUserProfile()} className={`${itemBase} ${itemIdle} w-full`}>
          <UserCircle className="size-[18px]" />
          Akun
        </button>
        <button type="button" onClick={() => signOut({ redirectUrl: "/" })} className={`${itemBase} ${itemIdle} w-full`}>
          <SignOut className="size-[18px]" />
          Keluar
        </button>
      </div>

      {/* Phones: account actions sit under the nav row. */}
      <div className="flex items-center gap-5 px-6 pb-4 text-sm md:hidden">
        <span className="min-w-0 flex-1 truncate text-xs text-[#6f7782]">{email}</span>
        <button type="button" onClick={() => openUserProfile()} className={`cursor-pointer text-[#8c95a1] hover:text-white ${focusRing}`}>
          Akun
        </button>
        <button type="button" onClick={() => signOut({ redirectUrl: "/" })} className={`cursor-pointer text-[#8c95a1] hover:text-white ${focusRing}`}>
          Keluar
        </button>
      </div>
    </aside>
  );
}

export function DashboardTitle({ children, meta }: { children: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-[#e8ebef] sm:text-5xl">{children}</h1>
      {meta && <p className="mt-4 text-[#8c95a1]">{meta}</p>}
    </div>
  );
}
