"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { MapPin, Fuel, Gauge } from "lucide-react"
import type { Car } from "@/types"
import { cn, formatPrice } from "@/lib/utils"

interface CarCardProps {
  car: Car
  index?: number
}

export default function CarCard({ car, index = 0 }: CarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link
        href={`/carros/${car.slug}`}
        className={cn(
          "group block overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300",
          "hover:shadow-lg hover:-translate-y-1"
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20 transition-transform duration-500 group-hover:scale-110">
            🚗
          </div>
          {car.isFeatured && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              Destaque
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
            {car.brand.name}
          </div>
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {car.title}
          </h3>
          <div className="mt-2 text-xl font-bold text-primary">
            {formatPrice(car.price)}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {car.year}
            </span>
            <span className="flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" />
              {car.fuelType}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {car.location}
            </span>
          </div>

          {car.mileage && (
            <div className="mt-2 text-xs text-muted">
              {car.mileage.toLocaleString("pt-BR")} km
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
