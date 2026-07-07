import { Features } from "@/components/landing/Feature"
import { Header } from "@/components/landing/Header"
import NewPricing from "@/components/landing/NewPricing"
import { Testimonial } from "@/components/landing/Testimonial"
import { Testimonials2 } from "@/components/landing/Testimonial2"
import { FAQ } from "@/components/landing/FAQ"
import MainLayout from "@/components/layouts/main-layout"
import { faqData } from "@/data/faq"
import type { Metadata } from "next"

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

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
}

export default function Page() {
  return (
    <>
      <script
        async
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
