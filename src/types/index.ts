export interface Car {
  id: string
  title: string
  slug: string
  description: string
  price: number
  year: number
  mileage: number | null
  fuelType: string | null
  transmission: string | null
  color: string | null
  doors: number | null
  capacity: number | null
  location: string | null
  isSold: boolean
  isFeatured: boolean
  brand: Brand
  category: Category
  images: CarImage[]
}

export interface Brand {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface CarImage {
  id: string
  url: string
  alt: string | null
  isPrimary: boolean
}

export interface CarFilters {
  search?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
  fuelType?: string
  transmission?: string
  sort?: "price-asc" | "price-desc" | "year-desc" | "year-asc"
}
