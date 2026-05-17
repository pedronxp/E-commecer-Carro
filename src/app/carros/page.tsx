import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
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
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <Image
          src="/images/banners/catalog-safe.png"
          alt="Estoque de veículos em ambiente de showroom"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(2,6,23,0.94)_0%,_rgba(2,6,23,0.78)_52%,_rgba(2,6,23,0.34)_100%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-light">
              Catálogo Lima Automóveis
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Veja os carros disponíveis e fale com a loja.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Filtre por modelo, marca, preço, ano, câmbio ou combustível. Quando encontrar uma opção boa,
              abra os detalhes e chame o atendimento para confirmar disponibilidade.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-border bg-white p-3 shadow-sm sm:p-4">
          <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-lg bg-surface" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="grid gap-6 lg:grid-cols-[288px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-border bg-white p-5 shadow-sm">
              <div className="mb-4 border-b border-border pb-4">
                <h3 className="text-sm font-semibold text-foreground">Refinar busca</h3>
                <p className="text-xs text-muted">Preço, ano, marca e câmbio</p>
              </div>
              <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-surface" />}>
                <FiltersSidebar />
              </Suspense>
            </div>
          </div>

          <main className="min-w-0">
            <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {results.length} veículo{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Abra o detalhe para ver fotos, ficha e chamar atendimento.
                </p>
              </div>
              {activeFilterCount > 0 && (
                <Link href="/carros" className="text-sm font-semibold text-primary hover:text-primary-dark">
                  Limpar filtros
                </Link>
              )}
            </div>

            {results.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((car, idx) => (
                  <CarCard key={car.id} car={car} index={idx} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white px-6 py-20 text-center">
                <h2 className="text-lg font-semibold text-foreground">Nenhum veículo apareceu com esses filtros</h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                  Tente ampliar preço, ano ou marca. Se você procura algo específico, fale com a loja para verificar
                  opções próximas.
                </p>
                <Link
                  href="/contato"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Falar no WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </main>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-white p-5 shadow-sm lg:hidden">
          <div className="mb-4 border-b border-border pb-4">
            <h3 className="text-sm font-semibold text-foreground">Refinar busca</h3>
            <p className="text-xs text-muted">Filtros para celular</p>
          </div>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-surface" />}>
            <FiltersSidebar />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default function CarrosPage({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 h-48 animate-pulse rounded-lg bg-surface" />
          <div className="mb-6 h-12 w-full animate-pulse rounded-lg bg-surface" />
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        </div>
      }
    >
      <ListingContent searchParams={searchParams} />
    </Suspense>
  )
}
