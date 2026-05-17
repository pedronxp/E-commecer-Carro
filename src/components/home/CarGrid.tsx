import Link from "next/link"
import { ArrowRight } from "lucide-react"
import CarCard from "@/components/carros/CarCard"
import { getFeaturedCars } from "@/lib/data"

export default function CarGrid() {
  const featured = getFeaturedCars().slice(0, 4)

  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
              Destaques do estoque
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Carros em destaque para você conhecer.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Abra o anúncio para ver fotos, preço e detalhes. Se algum modelo fizer sentido para você, chame a loja e
              confirme tudo pelo WhatsApp.
            </p>
          </div>
          <Link
            href="/carros"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-md"
          >
            Ver catálogo completo
            <ArrowRight className="h-4 w-4" />
          </Link>
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
