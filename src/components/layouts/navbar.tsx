"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Logo } from "../logo"
import { Button } from "../ui/button"

interface Session {
  id: string
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  ipAddress?: string | null | undefined | undefined
  userAgent?: string | null | undefined | undefined
}

interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

interface NavbarProps {
  session: {
    session: Session
    user: User
  } | null
}

export default function Navbar({ session }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Set isScrolled to true when scrolled down more than 50px
      // Only set to false when completely at the top (scrollY === 0)
      if (window.scrollY > 80) {
        setIsScrolled(true)
      } else if (window.scrollY === 0) {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const renderNavigation = () => {
    if (session) {
      return (
        <Button variant="ghost" className="cursor-pointer active:scale-[0.975]" asChild>
          <Link href="/home">Home</Link>
        </Button>
      )
    }

    return (
      <>
        <Button variant="ghost" className="cursor-pointer active:scale-[0.975]" asChild>
          <Link href="/login">Login</Link>
        </Button>

        <Button
          variant="outline"
          className="rounded-full dark:border-accent cursor-pointer transition active:scale-[0.975]"
          asChild
        >
          <Link href="/register">Get Started</Link>
        </Button>
      </>
    )
  }

  return (
    <nav className="relative w-full">
      <div
        className={cn(
          "fixed left-0 right-0 z-20 transition-all duration-300",
          isScrolled && "bg-background/75 backdrop-blur-lg"
        )}
      >
        <div className="flex justify-center">
          <div className="flex w-full max-w-[1328px] justify-between px-8 py-4">
            {/* brand logo */}
            <Logo />

            <div className="flex gap-2">
              {/* check navigation */}
              {renderNavigation()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
