import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vidiopintar - Learn anything from YouTube with AI!",
  description: "Learn from YouTube videos with AI chat",
  openGraph: {
    title: "Vidiopintar - Learn anything from YouTube with AI!",
    description: "Learn from YouTube videos with AI chat",
    images: [
      {
        url: "/images/vidiopintar-og.jpeg",
        width: 1200,
        height: 630,
        alt: "Vidiopintar - Learn anything from YouTube with AI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidiopintar - Learn anything from YouTube with AI!",
    description: "Learn from YouTube videos with AI chat",
    images: ["/images/vidiopintar-og.jpeg"],
  },
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Get the locale from the configuration (which reads from cookies)
  const locale = await getLocale();
  
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <Script
        src="https://vince.ngooding.com/js/script.js"
        data-domain="vidiopintar.com"
        strategy="afterInteractive"
      />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="vidiopintar-theme">
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
