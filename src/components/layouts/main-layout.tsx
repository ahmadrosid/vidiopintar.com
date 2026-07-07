import React from "react"
import { Footer } from "./footer"
import Navbar from "./navbar"

interface MainLayoutProps {
  cta?: boolean
  children: React.ReactNode
}

export default function MainLayout({ children, cta = true }: MainLayoutProps) {
  return (
    <div className="flex justify-center">
      <div className="w-full flex flex-col justify-center align-middle max-w-[1328px] px-8">
        <Navbar />

        {/* render children */}
        {children}

        {/* footer */}
        <Footer cta={cta} />
      </div>
    </div>
  )
}
