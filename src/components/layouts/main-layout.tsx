import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import React from "react"
import { Footer } from "./footer"
import Navbar from "./navbar"

interface MainLayoutProps {
  cta?: boolean
  children: React.ReactNode
}

export default async function MainLayout({ children, cta = true }: MainLayoutProps) {
  // Check if user is logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div className="flex justify-center">
      <div className="w-full flex flex-col justify-center align-middle max-w-[1328px] px-8">
        <Navbar session={session} />

        {/* render children */}
        {children}

        {/* footer */}
        <Footer cta={cta} />
      </div>
    </div>
  )
}
