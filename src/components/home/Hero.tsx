import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-secondary px-4 py-24 text-white sm:py-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
            style={{ animation: "slide-up 0.6s ease-out" }}
          >
            <Sparkles className="h-4 w-4 text-accent" />
            Catálogo exclusivo com mais de 500 veículos
          </div>

          <h1
            className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            style={{ animation: "slide-up 0.6s ease-out 0.15s both" }}
          >
            Encontre o carro <br />
            <span className="text-accent">dos seus sonhos</span>
          </h1>

          <p
            className="mt-6 max-w-lg text-lg leading-relaxed text-white/70"
            style={{ animation: "slide-up 0.6s ease-out 0.3s both" }}
          >
            Os melhores veículos premium com condições imperdíveis.
            Financeiro aprovado na hora e entrega em todo Brasil.
          </p>

          <div
            className="mt-8 flex flex-wrap gap-4"
            style={{ animation: "slide-up 0.6s ease-out 0.45s both" }}
          >
            <Link href="/carros">
              <Button size="lg" className="bg-accent text-secondary hover:bg-accent/90">
                Ver Catálogo
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/carros">
              <Button size="lg" variant="outline">
                Simular Financiamento
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
