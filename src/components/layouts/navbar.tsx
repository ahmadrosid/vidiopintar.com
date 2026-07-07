"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { AuthControls } from "@/components/auth-controls"
import { Logo } from "../logo"

export default function Navbar() {
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

            <div className="flex items-center gap-2">
              <AuthControls />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
