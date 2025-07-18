import { HeroSection } from "@/components/landing/hero-section";
import { HeroHeader } from "@/components/hero-header";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { WallOfLoveSection } from "@/components/landing/testimonials";
import { FooterSection } from "@/components/footer";
import { CallToAction } from "@/components/landing/call-to-action";

export const maxDuration = 60;

export default function Page() {
  return (
    <>
      <HeroHeader />
      <HeroSection />
      <Features />
      <Pricing />
      <WallOfLoveSection />
      <CallToAction />
      <FooterSection />
    </>
  )
}
