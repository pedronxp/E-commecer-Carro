export interface Car {
  id: string
  title: string
  slug: string
  description: string
  price: number
  purchasePrice?: number | null
  fipePrice?: number | null
  year: number
  mileage: number | null
  fuelType: string | null
  transmission: string | null
  color: string | null
  doors: number | null
  capacity: number | null
  location: string | null
  features?: string[]
  vehicleType?: "CAR" | "MOTORCYCLE" | "ELECTRIC_BIKE"
  condition?: "NEW" | "USED"
  isSold: boolean
  isFeatured: boolean
  isPromotion?: boolean
  promotionNote?: string | null
  brand: Brand
  category: Category
  images: CarImage[]
  modelUrl?: string | null
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
