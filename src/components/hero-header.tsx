"use client";
import { LogOut } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient, useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageSelector } from "@/components/language-selector";

export const HeroHeader = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user && !isPending;
  const t = useTranslations("navigation");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        className={cn(
          "fixed z-20 w-full transition-all duration-300",
          isScrolled &&
            "border-black/5 border-b bg-background/75 backdrop-blur-lg"
        )}
      >
        <div className="mx-auto max-w-[1328px] px-8">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-4 lg:gap-0 lg:py-3">
            <Link
              aria-label="home"
              className="flex items-center space-x-2"
              href={isHome ? "/" : "/home"}
            >
              <Logo />
            </Link>

            <div className="flex items-center gap-6">
              <LanguageSelector iconOnly />
              {mounted && isHome ? (
                <>
                  {isAuthenticated ? (
                    <Link href="/home">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span>{t("home")}</span>
                      </Button>
                    </Link>
                  ) : (
                    <GuestMenus isScrolled={isScrolled} t={t} />
                  )}
                </>
              ) : mounted ? (
                !isAuthenticated ? (
                  <GuestMenus isScrolled={isScrolled} t={t} />
                ) : (
                  <div className="flex gap-2">
                    <Link href="/profile/notes">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <span>{t("notes")}</span>
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                      >
                        <span>{t("profile")}</span>
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("logout")}</span>
                    </Button>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

const GuestMenus = ({
  isScrolled,
  t,
}: {
  isScrolled: boolean;
  t: (key: string) => string;
}) => {
  return (
    <>
      <Link href="/login">
        <Button
          variant="outline"
          size="sm"
          className={cn(isScrolled && "lg:hidden")}
        >
          <span>{t("login")}</span>
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm" className={cn(isScrolled && "lg:hidden")}>
          <span>{t("signUp")}</span>
        </Button>
      </Link>
      <Link href="/home">
        <Button size="sm" className={cn(!isScrolled && "hidden")}>
          <span>{t("getStarted")}</span>
        </Button>
      </Link>
    </>
  );
};
