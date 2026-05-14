import type { Car } from "@/types"
import type { CarRepository } from "../types"
import type { CarFilters } from "@/types"

export class MockCarRepository implements CarRepository {
  private cars: Car[]

  constructor(cars: Car[]) {
    this.cars = cars
  }

  getAll(): Car[] {
    return this.cars
  }

  getFeatured(): Car[] {
    return this.cars.filter((c) => c.isFeatured)
  }

  getBySlug(slug: string): Car | undefined {
    return this.cars.find((c) => c.slug === slug)
  }

  filter(filters: CarFilters): Car[] {
    let result = [...this.cars]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.brand.name.toLowerCase().includes(q)
      )
    }
    if (filters.brand) {
      result = result.filter((c) => c.brand.slug === filters.brand)
    }
    if (filters.minPrice !== undefined) {
      const min = filters.minPrice
      result = result.filter((c) => c.price >= min)
    }
    if (filters.maxPrice !== undefined) {
      const max = filters.maxPrice
      result = result.filter((c) => c.price <= max)
    }
    if (filters.minYear !== undefined) {
      const min = filters.minYear
      result = result.filter((c) => c.year >= min)
    }
    if (filters.maxYear !== undefined) {
      const max = filters.maxYear
      result = result.filter((c) => c.year <= max)
    }
    if (filters.fuelType) {
      const fuel = filters.fuelType.toLowerCase()
      result = result.filter((c) => c.fuelType?.toLowerCase() === fuel)
    }
    if (filters.transmission) {
      const trans = filters.transmission.toLowerCase()
      result = result.filter((c) => c.transmission?.toLowerCase() === trans)
    }

    if (filters.sort) {
      result.sort((a, b) => {
        switch (filters.sort) {
          case "price-asc":
            return a.price - b.price
          case "price-desc":
            return b.price - a.price
          case "year-desc":
            return b.year - a.year
          case "year-asc":
            return a.year - b.year
          default:
            return 0
        }
      })
    }

    return result
  }
}
