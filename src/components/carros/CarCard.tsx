import Link from "next/link"
import { MapPin, Fuel, Gauge, Calendar, Heart } from "lucide-react"
import type { Car } from "@/types"
import { formatPrice } from "@/lib/utils"

interface CarCardProps {
  car: Car
  index?: number
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <Link
      href={`/carros/${car.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-white transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-surface to-border">
        <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-10 transition-transform duration-500 group-hover:scale-110">
          🚗
        </div>
        {car.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Destaque
          </span>
        )}
        <button
          className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 text-muted backdrop-blur-sm opacity-0 transition-all group-hover:opacity-100 hover:bg-white hover:text-primary"
          onClick={(e) => e.preventDefault()}
          aria-label="Favoritar"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
          {car.brand.name}
        </div>
        <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {car.title}
        </h3>
        <div className="mt-2 text-xl font-bold text-primary">
          {formatPrice(car.price)}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {car.year}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="h-3.5 w-3.5" />
            {car.fuelType}
          </span>
          {car.mileage && (
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {car.mileage.toLocaleString("pt-BR")} km
            </span>
          )}
          {car.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {car.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
