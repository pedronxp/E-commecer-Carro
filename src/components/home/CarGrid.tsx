import Link from "next/link"
import { ArrowRight, Gauge, ShieldCheck } from "lucide-react"
import CarCard from "@/components/carros/CarCard"
import { getFeaturedCars } from "@/lib/data"

export default function CarGrid() {
  const featured = getFeaturedCars().slice(0, 4)

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" />
            Seleção da loja
          </p>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Veículos em destaque
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Uma vitrine curta para decidir rápido e continuar para o catálogo completo quando quiser comparar mais modelos.
          </p>
        </div>
        <Link
          href="/carros"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          Ver catálogo completo
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {["Seminovos", "Financiamento", "Avaliação", "Pronta entrega"].map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted"
          >
            <Gauge className="h-3.5 w-3.5 text-primary" />
            {label}
          </span>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((car, idx) => (
          <CarCard key={car.id} car={car} index={idx} />
        ))}
      </div>
    </section>
  )
}
