"use client";
import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { JetBrains_Mono } from 'next/font/google';
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] })

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Vidiopintar - Turn YouTube into Your Personal Learning Academy",
  description: "Learn from YouTube videos with ai chat, note-taking, and quizz",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <Script
        src="https://vince.ngooding.com/js/script.js"
        data-domain="vidiopintar.com"
        strategy="afterInteractive"
      />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
