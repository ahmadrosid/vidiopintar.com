import { FAQ } from "@/components/landing/FAQ";
import MainLayout from "@/components/layouts/main-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - AI YouTube Summarizer & Learning Tool | VidioPintar",
  description:
    "Get answers about VidioPintar's AI YouTube summarizer. Learn how to chat with videos, get instant transcripts, build your knowledge library, and learn faster from YouTube content with AI-powered insights.",
  openGraph: {
    title: "Frequently Asked Questions | VidioPintar",
    description:
      "Everything you need to know about learning faster from YouTube with AI. Get instant video summaries, chat with content, and build your knowledge library.",
    images: [
      {
        url: "/images/vidiopintar-og.jpeg",
        width: 1200,
        height: 630,
        alt: "VidioPintar FAQ - AI YouTube Learning",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ - AI YouTube Summarizer | VidioPintar",
    description:
      "Get answers about VidioPintar's AI YouTube summarizer. Learn faster from video content with AI-powered summaries and chat.",
    images: ["/images/vidiopintar-og.jpeg"],
  },
  alternates: {
    canonical: "/faq",
  },
  keywords: [
    "AI YouTube summarizer",
    "YouTube transcript tool",
    "video summary AI",
    "learn from YouTube",
    "AI video chat",
    "YouTube learning assistant",
    "educational video AI",
    "podcast summarizer",
    "video notes",
    "YouTube AI tool",
  ],
};

export default function FAQPage() {
  return (
    <MainLayout>
      <FAQ />
    </MainLayout>
  );
}
