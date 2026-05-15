import HeroCarousel from "@/components/home/HeroCarousel"
import CarGrid from "@/components/home/CarGrid"
import FeaturesSection from "@/components/home/FeaturesSection"
import StatsSection from "@/components/home/StatsSection"
import TestimonialsSection from "@/components/home/TestimonialsSection"
import CTASection from "@/components/home/CTASection"

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <FeaturesSection />
      <CarGrid />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  )
}
