import { HeroSection } from "@/components/landing/hero-section";
import { HeroHeader } from "@/components/hero-header";
import { Features } from "@/components/landing/features";
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
      <WallOfLoveSection />
      <CallToAction />
      <FooterSection />
    </>
  )
}
