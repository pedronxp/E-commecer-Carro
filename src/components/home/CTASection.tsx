import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function CTASection() {
  return (
    <section className="bg-gradient-to-br from-primary to-primary-dark py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
            Pronto para encontrar seu carro ideal?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Visite nossa loja ou entre em contato agora mesmo. Nossa equipe está pronta para ajudar você.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/carros">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Ver Catálogo
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+5500000000000">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Phone className="h-5 w-5" />
                Ligar Agora
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
