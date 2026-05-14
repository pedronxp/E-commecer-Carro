import type { Car } from "@/types"
import { brands } from "./brands"

interface CarDatum {
  title: string
  brand: string
  price: number
  year: number
  mileage: number
  fuel: string
  trans: string
  doors: number
  capacity: number
  featured: boolean
}

const category = { id: "1", name: "Esportivos", slug: "esportivos" }

export const carData: CarDatum[] = [
  { title: "Porsche 911 Carrera", brand: "Porsche", price: 849900, year: 2025, mileage: 8000, fuel: "Gasolina", trans: "Automática", doors: 2, capacity: 4, featured: true },
  { title: "BMW X6 M Competition", brand: "BMW", price: 529900, year: 2024, mileage: 15000, fuel: "Diesel", trans: "Automática", doors: 5, capacity: 5, featured: true },
  { title: "Audi RS7 Sportback", brand: "Audi", price: 689900, year: 2025, mileage: 5000, fuel: "Gasolina", trans: "Automática", doors: 5, capacity: 5, featured: true },
  { title: "Mercedes-AMG GT 63", brand: "Mercedes-Benz", price: 749900, year: 2024, mileage: 12000, fuel: "Híbrido", trans: "Automática", doors: 4, capacity: 4, featured: true },
  { title: "Ferrari SF90 Stradale", brand: "Ferrari", price: 2899900, year: 2025, mileage: 2000, fuel: "Híbrido", trans: "Automática", doors: 2, capacity: 2, featured: false },
  { title: "Lamborghini Huracán STO", brand: "Lamborghini", price: 3450000, year: 2024, mileage: 3500, fuel: "Gasolina", trans: "Automática", doors: 2, capacity: 2, featured: false },
  { title: "Toyota GR Supra", brand: "Toyota", price: 349900, year: 2025, mileage: 1000, fuel: "Gasolina", trans: "Manual", doors: 2, capacity: 2, featured: true },
  { title: "Honda Civic Type R", brand: "Honda", price: 259900, year: 2024, mileage: 18000, fuel: "Gasolina", trans: "Manual", doors: 5, capacity: 5, featured: false },
  { title: "Volkswagen Golf GTI", brand: "Volkswagen", price: 189900, year: 2024, mileage: 22000, fuel: "Gasolina", trans: "Automática", doors: 5, capacity: 5, featured: false },
  { title: "Chevrolet Corvette Z06", brand: "Chevrolet", price: 899900, year: 2025, mileage: 4000, fuel: "Gasolina", trans: "Automática", doors: 2, capacity: 2, featured: true },
  { title: "BMW M3 Competition", brand: "BMW", price: 459900, year: 2025, mileage: 7000, fuel: "Gasolina", trans: "Automática", doors: 4, capacity: 5, featured: false },
  { title: "Audi R8 V10", brand: "Audi", price: 1250000, year: 2024, mileage: 9000, fuel: "Gasolina", trans: "Automática", doors: 2, capacity: 2, featured: false },
]

function slugFromTitle(title: string): string {
  return title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")
}

export const cars: Car[] = carData.map((item, idx) => {
  const brand = brands.find((b) => b.name === item.brand) ?? {
    id: "unknown",
    name: item.brand,
    slug: slugFromTitle(item.brand),
  }
  return {
    id: String(idx + 1),
    title: item.title,
    slug: slugFromTitle(item.title),
    description: `${item.title} em perfeito estado. Completo, único dono, revisões em concessionária.`,
    price: item.price,
    year: item.year,
    mileage: item.mileage,
    fuelType: item.fuel,
    transmission: item.trans,
    color: null,
    doors: item.doors,
    capacity: item.capacity,
    location: "São Paulo, SP",
    isSold: false,
    isFeatured: item.featured,
    brand,
    category,
    images: [{ id: `${idx}-1`, url: "/placeholder.svg", alt: item.title, isPrimary: true }],
  }
})
