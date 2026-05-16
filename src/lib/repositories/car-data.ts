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
  images: string[]
  modelUrl?: string
}

const category = { id: "1", name: "Esportivos", slug: "esportivos" }

export const carData: CarDatum[] = [
  { title: "Porsche 911 Carrera", brand: "Porsche", price: 849900, year: 2025, mileage: 8000, fuel: "Gasolina", trans: "Automática", doors: 2, capacity: 4, featured: true, images: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=85"], modelUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb" },
  { title: "BMW X6 M Competition", brand: "BMW", price: 529900, year: 2024, mileage: 15000, fuel: "Diesel", trans: "Automática", doors: 5, capacity: 5, featured: true, images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Audi RS7 Sportback", brand: "Audi", price: 689900, year: 2025, mileage: 5000, fuel: "Gasolina", trans: "Automática", doors: 5, capacity: 5, featured: true, images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Mercedes-AMG GT 63", brand: "Mercedes-Benz", price: 749900, year: 2024, mileage: 12000, fuel: "Híbrido", trans: "Automática", doors: 4, capacity: 4, featured: true, images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Ferrari SF90 Stradale", brand: "Ferrari", price: 2899900, year: 2025, mileage: 2000, fuel: "Híbrido", trans: "Automática", doors: 2, capacity: 2, featured: false, images: ["https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Lamborghini Huracán STO", brand: "Lamborghini", price: 3450000, year: 2024, mileage: 3500, fuel: "Gasolina", trans: "Automática", doors: 2, capacity: 2, featured: false, images: ["https://images.unsplash.com/photo-1519245659620-e859806a8d3b?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Toyota GR Supra", brand: "Toyota", price: 349900, year: 2025, mileage: 1000, fuel: "Gasolina", trans: "Manual", doors: 2, capacity: 2, featured: true, images: ["https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1617814076668-9db6c10fcd44?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Honda Civic Type R", brand: "Honda", price: 259900, year: 2024, mileage: 18000, fuel: "Gasolina", trans: "Manual", doors: 5, capacity: 5, featured: false, images: ["https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Volkswagen Golf GTI", brand: "Volkswagen", price: 189900, year: 2024, mileage: 22000, fuel: "Gasolina", trans: "Automática", doors: 5, capacity: 5, featured: false, images: ["https://images.unsplash.com/photo-1597007066704-67bf2068d5b2?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Chevrolet Corvette Z06", brand: "Chevrolet", price: 899900, year: 2025, mileage: 4000, fuel: "Gasolina", trans: "Automática", doors: 2, capacity: 2, featured: true, images: ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=85"] },
  { title: "BMW M3 Competition", brand: "BMW", price: 459900, year: 2025, mileage: 7000, fuel: "Gasolina", trans: "Automática", doors: 4, capacity: 5, featured: false, images: ["https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1600&q=85"] },
  { title: "Audi R8 V10", brand: "Audi", price: 1250000, year: 2024, mileage: 9000, fuel: "Gasolina", trans: "Automática", doors: 2, capacity: 2, featured: false, images: ["https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=1600&q=85", "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=85"] },
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
    modelUrl: item.modelUrl ?? null,
    images: item.images.map((url, imageIdx) => ({
      id: `${idx}-${imageIdx + 1}`,
      url,
      alt: `${item.title} - foto ${imageIdx + 1}`,
      isPrimary: imageIdx === 0,
    })),
  }
})
