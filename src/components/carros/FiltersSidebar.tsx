"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { brands } from "@/lib/data"
import { Select } from "@/components/ui/Select"
import { NumberInput } from "@/components/ui/NumberInput"

const fuelTypes = ["Gasolina", "Diesel", "Híbrido", "Elétrico"]
const transmissions = ["Automática", "Manual"]
const sortOptions = [
  { value: "price-asc", label: "Menor Preço" },
  { value: "price-desc", label: "Maior Preço" },
  { value: "year-desc", label: "Mais Novo" },
  { value: "year-asc", label: "Mais Antigo" },
]

export default function FiltersSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/carros?${params.toString()}`)
  }

  function resetFilters() {
    router.push("/carros")
  }

  const hasFilters = Array.from(searchParams.keys()).length > 0

  return (
    <aside className="space-y-6">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <RotateCcw className="h-3 w-3" /> Limpar
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <Select
            label="Marca"
            value={searchParams.get("brand") || ""}
            onChange={(e) => updateParam("brand", e.target.value)}
          >
            <option value="">Todas as marcas</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </Select>

          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-muted">Preço</legend>
            <div className="flex gap-2">
              <NumberInput
                placeholder="Mín"
                value={searchParams.get("minPrice") || ""}
                onChange={(e) => updateParam("minPrice", e.target.value)}
              />
              <NumberInput
                placeholder="Máx"
                value={searchParams.get("maxPrice") || ""}
                onChange={(e) => updateParam("maxPrice", e.target.value)}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-muted">Ano</legend>
            <div className="flex gap-2">
              <NumberInput
                placeholder="Mín"
                value={searchParams.get("minYear") || ""}
                onChange={(e) => updateParam("minYear", e.target.value)}
              />
              <NumberInput
                placeholder="Máx"
                value={searchParams.get("maxYear") || ""}
                onChange={(e) => updateParam("maxYear", e.target.value)}
              />
            </div>
          </fieldset>

          <Select
            label="Combustível"
            value={searchParams.get("fuelType") || ""}
            onChange={(e) => updateParam("fuelType", e.target.value)}
          >
            <option value="">Todos</option>
            {fuelTypes.map((f) => (
              <option key={f} value={f.toLowerCase()}>
                {f}
              </option>
            ))}
          </Select>

          <Select
            label="Câmbio"
            value={searchParams.get("transmission") || ""}
            onChange={(e) => updateParam("transmission", e.target.value)}
          >
            <option value="">Todos</option>
            {transmissions.map((t) => (
              <option key={t} value={t.toLowerCase()}>
                {t}
              </option>
            ))}
          </Select>

          <Select
            label="Ordenar por"
            value={searchParams.get("sort") || ""}
            onChange={(e) => updateParam("sort", e.target.value)}
          >
            <option value="">Padrão</option>
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </aside>
  )
}
