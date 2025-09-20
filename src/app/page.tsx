import { Features } from "@/components/landing/Feature"
import { Header } from "@/components/landing/Header"
import NewPricing from "@/components/landing/NewPricing"
import { Testimonial } from "@/components/landing/Testimonial"
import { Testimonials2 } from "@/components/landing/Testimonial2"
import { Topics } from "@/components/landing/Topic"
import MainLayout from "@/components/layouts/main-layout"

export default function Page() {
  return (
    <MainLayout>
      <Header />
      <Testimonial />
      <Features />
      <Topics />
      <Testimonials2 />
      <NewPricing />
    </MainLayout>
  )
}
