import Link from "next/link"
import { ArrowRight } from "lucide-react"
import CarCard from "@/components/carros/CarCard"
import { getFeaturedCars } from "@/lib/data"

export default function CarGrid() {
  const featured = getFeaturedCars()

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Destaques</h2>
          <p className="mt-1 text-sm text-muted">
            Os veículos mais procurados do momento
          </p>
        </div>
        <Link
          href="/carros"
          className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-dark sm:flex"
        >
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {featured.map((car, idx) => (
          <CarCard key={car.id} car={car} index={idx} />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/carros"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          Ver todos os carros <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
