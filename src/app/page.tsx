import { Features } from "@/components/landing/Feature"
import { Header } from "@/components/landing/Header"
import NewPricing from "@/components/landing/NewPricing"
import { Testimonial } from "@/components/landing/Testimonial"
import { Testimonials2 } from "@/components/landing/Testimonial2"
import { FAQ } from "@/components/landing/FAQ"
import MainLayout from "@/components/layouts/main-layout"
import { faqData } from "@/data/faq"
import { buildPageMetadata } from "@/lib/geo/metadata"
import { SITE_LAST_MODIFIED, SITE_URL } from "@/lib/geo/site"

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Vidiopintar - Learn from YouTube with AI",
  url: SITE_URL,
  dateModified: SITE_LAST_MODIFIED.toISOString(),
  description:
    "Turn YouTube videos into AI summaries, interactive chat, and organized notes.",
}

export const metadata = buildPageMetadata({
  title: "Vidiopintar - Learn from YouTube with AI",
  description:
    "Turn YouTube videos into AI summaries, interactive chat, and organized notes. Learn faster from tutorials, podcasts, and lectures.",
  path: "/",
})

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <MainLayout>
        <Header />
        <Testimonial />
        <Features />
        <Testimonials2 />
        <NewPricing />
        <FAQ />
      </MainLayout>
    </>
  )
}
