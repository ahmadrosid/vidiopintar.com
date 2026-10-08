"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "API key" },
  { href: "/dashboard/billing", label: "Tagihan" },
  { href: "/panduan", label: "Panduan" },
];

const itemClass = "cursor-pointer text-[#8c95a1] hover:text-white";

export function DashboardNav() {
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();

  return (
    <nav className="flex flex-wrap items-baseline justify-end gap-x-5 gap-y-2 text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={pathname === link.href ? "text-[#e8ebef] underline decoration-[#e28fab] underline-offset-4" : itemClass}
        >
          {link.label}
        </Link>
      ))}
      <button type="button" onClick={() => openUserProfile()} className={itemClass}>
        Akun
      </button>
      <button type="button" onClick={() => signOut({ redirectUrl: "/" })} className={itemClass}>
        Keluar
      </button>
    </nav>
  );
}
