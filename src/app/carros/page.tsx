import { Suspense } from "react"
import Image from "next/image"
import { Car, SlidersHorizontal } from "lucide-react"
import CarCard from "@/components/carros/CarCard"
import FiltersSidebar from "@/components/carros/FiltersSidebar"
import SearchBar from "@/components/carros/SearchBar"
import { filterCars } from "@/lib/data"
import type { CarFilters } from "@/types"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

const VALID_SORT = ["price-asc", "price-desc", "year-desc", "year-asc"] as const

function safeNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

async function ListingContent({ searchParams }: PageProps) {
  const params = await searchParams
  const filters: CarFilters = {
    search: params.search?.slice(0, 200),
    brand: params.brand,
    minPrice: safeNumber(params.minPrice),
    maxPrice: safeNumber(params.maxPrice),
    minYear: safeNumber(params.minYear),
    maxYear: safeNumber(params.maxYear),
    fuelType: params.fuelType,
    transmission: params.transmission,
    sort: VALID_SORT.includes(params.sort as typeof VALID_SORT[number]) ? (params.sort as CarFilters["sort"]) : undefined,
  }

  const results = filterCars(filters)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-slate-950 px-6 py-10 text-white shadow-sm sm:px-8">
        <Image
          src="/images/banners/catalog-safe.png"
          alt="Estoque fictício de veículos sem marcas, placas ou modelos reais reconhecíveis"
          fill
          priority
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.88)_0%,_rgba(2,6,23,0.62)_42%,_rgba(2,6,23,0.18)_100%)]" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Estoque selecionado
          </p>
          <h1 className="mt-3 text-2xl font-bold sm:text-4xl">Catálogo de veículos</h1>
          <p className="mt-3 text-sm text-white/78">
            {results.length} veículo{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}. As imagens de banner usam carros fictícios para evitar marcas e modelos protegidos.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-xl bg-surface" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex gap-8">
        <div className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
            </div>
            <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-surface" />}>
              <FiltersSidebar />
            </Suspense>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="flex-1">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((car, idx) => (
                <CarCard key={car.id} car={car} index={idx} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Nenhum veículo encontrado</h2>
            <p className="mt-1 text-sm text-muted">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 lg:hidden">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-surface" />}>
          <FiltersSidebar />
        </Suspense>
      </div>
    </div>
  )
}

export default function CarrosPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 h-10 w-64 animate-pulse rounded-lg bg-surface" />
          <div className="mb-6 h-12 w-full animate-pulse rounded-xl bg-surface" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        </div>
      }
    >
      <ListingContent searchParams={searchParams} />
    </Suspense>
  )
}
