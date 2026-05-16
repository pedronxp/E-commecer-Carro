import Link from "next/link"
import { ArrowRight, Gauge, ShieldCheck } from "lucide-react"
import CarCard from "@/components/carros/CarCard"
import { getFeaturedCars } from "@/lib/data"

export default function CarGrid() {
  const featured = getFeaturedCars().slice(0, 4)

  return (
    <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" />
              Seleção da loja
            </span>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Veículos em destaque
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Uma vitrine dos modelos selecionados para ajudar na sua decisão. Veja o catálogo completo quando quiser comparar mais opções.
            </p>
          </div>
          <Link
            href="/carros"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-md"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {["Seminovos", "Financiamento", "Avaliação de veículos", "Pronta entrega"].map(
            (label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted shadow-sm"
              >
                <Gauge className="h-3.5 w-3.5 text-primary" />
                {label}
              </span>
            ),
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((car, idx) => (
            <CarCard key={car.id} car={car} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
