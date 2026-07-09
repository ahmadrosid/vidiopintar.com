import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Geist, Geist_Mono } from "next/font/google";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/geo/site";
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
  title: {
    default: "Vidiopintar - Learn from YouTube with AI",
    template: "%s | Vidiopintar",
  },
  description:
    "Turn YouTube videos into AI summaries, interactive chat, and organized notes. Learn faster from tutorials, podcasts, and lectures.",
  openGraph: {
    title: "Vidiopintar - Learn from YouTube with AI",
    description:
      "Turn YouTube videos into AI summaries, interactive chat, and organized notes.",
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Vidiopintar - Learn from YouTube with AI",
      },
    ],
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidiopintar - Learn from YouTube with AI",
    description:
      "Turn YouTube videos into AI summaries, interactive chat, and organized notes.",
    images: [OG_IMAGE],
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
  authors: [{ name: SITE_NAME }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    types: {
      "text/markdown": `${SITE_URL}/index.html.md`,
    },
  },
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: OG_IMAGE,
    description: "AI-powered YouTube learning platform that transforms videos into instant summaries and interactive chat experiences",
    sameAs: [
      "https://github.com/ahmadrosid/vidiopintar.com",
      "https://twitter.com/ahmadrosid",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@vidiopintar.com",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Learn anything from YouTube with AI-powered video summaries and chat",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/home?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="vidiopintar-theme">
          {children}
          <Toaster />
          </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
