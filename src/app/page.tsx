import HeroCarousel from "@/components/home/HeroCarousel"
import PathwayCards from "@/components/home/PathwayCards"
import CarGrid from "@/components/home/CarGrid"
import FeaturesSection from "@/components/home/FeaturesSection"
import CTASection from "@/components/home/CTASection"

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <PathwayCards />
      <CarGrid />
      <FeaturesSection />
      <CTASection />
    </>
  )
}
