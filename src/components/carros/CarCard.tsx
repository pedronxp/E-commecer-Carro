"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Fuel, Gauge, Calendar, Heart } from "lucide-react"
import type { Car } from "@/types"
import { formatPrice } from "@/lib/utils"

interface CarCardProps {
  car: Car
  index?: number
}

export default function CarCard({ car }: CarCardProps) {
  const primaryImage = car.images.find((image) => image.isPrimary) ?? car.images[0]

  return (
    <Link
      href={`/carros/${car.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-white transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-surface to-border">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? car.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-10 transition-transform duration-500 group-hover:scale-110">
            🚗
          </div>
        )}
        {car.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            Destaque
          </span>
        )}
        <button
          className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 text-muted opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-white hover:text-primary"
          onClick={(event) => event.preventDefault()}
          aria-label="Favoritar"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
          {car.brand.name}
        </div>
        <h3 className="line-clamp-1 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
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
