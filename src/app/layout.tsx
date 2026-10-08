import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type React from "react"
import { Toaster } from "@/components/ui/sonner"
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/geo/site";
import { serializeJsonLd } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bricolage_Grotesque({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: OG_IMAGE,
  description: "Layanan MCP untuk mengambil transkrip YouTube bagi agen AI.",
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
  description: "Layanan MCP untuk mengambil transkrip YouTube bagi agen AI.",
};

export const metadata: Metadata = {
  title: {
    default: "Transkrip YouTube untuk Agen AI | Vidiopintar",
    template: "%s | Vidiopintar",
  },
  description:
    "Satu alat MCP untuk mengambil transkrip YouTube dengan penanda waktu.",
  openGraph: {
    title: "Transkrip YouTube untuk Agen AI | Vidiopintar",
    description:
      "Satu alat MCP untuk mengambil transkrip YouTube dengan penanda waktu.",
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Vidiopintar — MCP transkrip YouTube",
      },
    ],
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "Transkrip YouTube untuk Agen AI | Vidiopintar",
    description:
      "Satu alat MCP untuk mengambil transkrip YouTube dengan penanda waktu.",
    images: [OG_IMAGE],
  },
  keywords: [
    "YouTube transcript",
    "MCP transkrip YouTube",
    "agen AI",
  ],
  authors: [{ name: SITE_NAME }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    types: {
      "text/markdown": `${SITE_URL}/index.html.md`,
    },
  },
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}>
        <ClerkProvider appearance={{ theme: shadcn }}>
          {children}
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  )
}
