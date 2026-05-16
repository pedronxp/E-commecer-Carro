import HeroCarousel from "@/components/home/HeroCarousel"
import CarGrid from "@/components/home/CarGrid"
import DecisionSection from "@/components/home/DecisionSection"
import FeaturesSection from "@/components/home/FeaturesSection"
import CTASection from "@/components/home/CTASection"

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <CarGrid />
      <DecisionSection />
      <FeaturesSection />
      <CTASection />
    </>
  )
}
