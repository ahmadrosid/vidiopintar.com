import { FAQ } from "@/components/landing/FAQ";
import MainLayout from "@/components/layouts/main-layout";
import { buildPageMetadata } from "@/lib/geo/metadata";
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/geo/site";

export const metadata = buildPageMetadata({
  title: "FAQ - AI YouTube Summarizer",
  description:
    "Answers about the Vidiopintar AI YouTube summarizer, video chat, pricing, privacy, and learning workflows.",
  path: "/faq",
  keywords: [
    "AI YouTube summarizer",
    "YouTube transcript tool",
    "video summary AI",
    "learn from YouTube",
    "AI video chat",
    "YouTube learning assistant",
  ],
});

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "FAQ - AI YouTube Summarizer",
  url: `${SITE_URL}/faq`,
  dateModified: SITE_LAST_MODIFIED.toISOString(),
};

export default function FAQPage() {
  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <FAQ headingLevel="h1" />
    </MainLayout>
  );
}
