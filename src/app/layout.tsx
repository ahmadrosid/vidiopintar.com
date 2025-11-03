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
  description: "Transform YouTube videos into instant AI-powered summaries, interactive chat, and organized knowledge. Learn faster from educational content, podcasts, and tutorials with VidioPintar's intelligent video analysis.",
  openGraph: {
    title: "Vidiopintar - Learn anything from YouTube with AI!",
    description: "Transform YouTube videos into instant AI-powered summaries, interactive chat, and organized knowledge. Learn faster from educational content, podcasts, and tutorials.",
    images: [
      {
        url: "/images/vidiopintar-og.jpeg",
        width: 1200,
        height: 630,
        alt: "Vidiopintar - Learn anything from YouTube with AI",
      },
    ],
    type: "website",
    siteName: "Vidiopintar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidiopintar - Learn anything from YouTube with AI!",
    description: "Transform YouTube videos into instant AI-powered summaries, interactive chat, and organized knowledge.",
    images: ["/images/vidiopintar-og.jpeg"],
  },
  keywords: [
    "AI YouTube summarizer",
    "YouTube transcript",
    "video summary",
    "learn from YouTube",
    "AI video chat",
    "YouTube learning tool",
    "educational video AI",
    "podcast summarizer",
    "video notes AI",
    "YouTube knowledge base",
  ],
  authors: [{ name: "Vidiopintar" }],
  metadataBase: new URL("https://vidiopintar.com"),
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

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vidiopintar",
    url: "https://vidiopintar.com",
    logo: "https://vidiopintar.com/images/vidiopintar-og.jpeg",
    description: "AI-powered YouTube learning platform that transforms videos into instant summaries and interactive chat experiences",
    sameAs: [
      "https://github.com/ahmadrosid/vidiopintar",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@vidiopintar.com",
    },
  };

  // WebSite Schema with Search Action
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vidiopintar",
    url: "https://vidiopintar.com",
    description: "Learn anything from YouTube with AI-powered video summaries and chat",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://vidiopintar.com/home?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <Script
        src="https://vince.ngooding.com/js/script.js"
        data-domain="vidiopintar.com"
        strategy="afterInteractive"
      />
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
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
