import type { Car, CarFilters } from "@/types"

export interface CarRepository {
  getAll(): Car[]
  getFeatured(): Car[]
  getBySlug(slug: string): Car | undefined
  filter(filters: CarFilters): Car[]
}
