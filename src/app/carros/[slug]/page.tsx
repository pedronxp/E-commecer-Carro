import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Fuel, Gauge, Calendar } from "lucide-react"
import { Button } from "@/components/ui/Button"
import CarMediaViewer from "@/components/carros/CarMediaViewer"
import { getCarBySlug } from "@/lib/data"
import { formatPrice } from "@/lib/utils"

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params
  const car = getCarBySlug(slug)

  if (!car) {
    notFound()
  }

  const discount =
    car.fipePrice && car.fipePrice > car.price
      ? Math.round(((car.fipePrice - car.price) / car.fipePrice) * 100)
      : 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/carros"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <CarMediaViewer title={car.title} images={car.images} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-muted">
                {car.brand.name}
              </p>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {car.title}
              </h1>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold text-primary">{formatPrice(car.price)}</p>
              {discount > 0 ? (
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {discount}% abaixo da FIPE ({formatPrice(car.fipePrice ?? 0)})
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-surface p-4 sm:grid-cols-4 sm:gap-6 sm:p-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted">Ano</span>
              <span className="text-sm font-semibold">{car.year}</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Gauge className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted">Quilometragem</span>
              <span className="text-sm font-semibold">
                {car.mileage?.toLocaleString("pt-BR") ?? "N/I"} km
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <Fuel className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted">Combustível</span>
              <span className="text-sm font-semibold">{car.fuelType ?? "N/I"}</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted">Localização</span>
              <span className="text-sm font-semibold">{car.location ?? "N/I"}</span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground">Descrição</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{car.description}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/financiamento">
              <Button size="lg" className="flex-1 sm:flex-none">
                Solicitar Financiamento
              </Button>
            </Link>
            <Link href="/contato">
              <Button size="lg" variant="outline" className="flex-1 sm:flex-none">
                Agendar Visita
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
