import type { Car, CarFilters } from "@/types"
import { MockCarRepository } from "./repositories/implementations/mock"
import { brands as brandList } from "./repositories/brands"
import { cars as carData } from "./repositories/car-data"

export const brands = brandList

const repository = new MockCarRepository(carData)

export function getFeaturedCars(): Car[] {
  return repository.getFeatured()
}

export function getCarBySlug(slug: string): Car | undefined {
  return repository.getBySlug(slug)
}

export function filterCars(filters: CarFilters): Car[] {
  return repository.filter(filters)
}
