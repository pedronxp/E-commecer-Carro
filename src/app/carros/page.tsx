import { Suspense } from "react"
import type { CarFilters } from "@/types"
import { filterCars } from "@/lib/data"
import CarCard from "@/components/carros/CarCard"
import SearchBar from "@/components/carros/SearchBar"
import FiltersSidebar from "@/components/carros/FiltersSidebar"
import { Car } from "lucide-react"

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Catálogo de Carros</h1>
        <p className="mt-1 text-sm text-muted">
          {results.length} veículo{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-11 w-full animate-pulse rounded-lg bg-gray-100" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="flex gap-8">
        <div className="hidden w-64 shrink-0 lg:block">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-gray-100" />}>
            <FiltersSidebar />
          </Suspense>
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
          <div className="flex flex-1 flex-col items-center justify-center py-20">
            <Car className="mb-4 h-12 w-12 text-muted" />
            <h2 className="text-lg font-semibold text-foreground">Nenhum veículo encontrado</h2>
            <p className="mt-1 text-sm text-muted">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 lg:hidden">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-gray-100" />}>
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
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mb-6 h-11 w-full animate-pulse rounded-lg bg-gray-100" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      }
    >
      <ListingContent searchParams={searchParams} />
    </Suspense>
  )
}
