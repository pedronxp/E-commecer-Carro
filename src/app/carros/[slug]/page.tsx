import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Fuel, Gauge, MapPin, MessageCircle, type LucideIcon } from "lucide-react"
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
    <div className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/carros"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <CarMediaViewer title={car.title} images={car.images} />

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_340px]">
            <main>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {car.brand.name}
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                {car.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                Veja fotos, ano, quilometragem e detalhes do carro. Para confirmar disponibilidade ou combinar visita,
                chame a loja pelo atendimento.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-4">
                <Spec icon={Calendar} label="Ano" value={String(car.year)} />
                <Spec icon={Gauge} label="Quilometragem" value={`${car.mileage?.toLocaleString("pt-BR") ?? "N/I"} km`} />
                <Spec icon={Fuel} label="Combustível" value={car.fuelType ?? "N/I"} />
                <Spec icon={MapPin} label="Localização" value={car.location ?? "N/I"} />
              </div>

              <div className="mt-7">
                <h2 className="text-lg font-semibold text-foreground">Sobre este veículo</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{car.description}</p>
              </div>
            </main>

            <aside className="h-fit rounded-lg border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Preço anunciado</p>
              <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(car.price)}</p>
              {discount > 0 ? (
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {discount}% abaixo da FIPE de referência ({formatPrice(car.fipePrice ?? 0)})
                </p>
              ) : null}

              <div className="mt-5 rounded-lg border border-border bg-white p-4 text-sm leading-relaxed text-muted">
                <MessageCircle className="mb-2 h-5 w-5 text-primary" />
                Gostou desse modelo? Fale com a loja para confirmar disponibilidade, tirar dúvidas e combinar o melhor horário.
              </div>

              <div className="mt-5 grid gap-3">
                <Link href="/contato">
                  <Button size="lg" className="w-full">
                    Falar no WhatsApp
                  </Button>
                </Link>
                <Link href="/financiamento">
                  <Button size="lg" variant="outline" className="w-full">
                    Ver financiamento
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0">
      <Icon className="h-4 w-4 text-primary" />
      <span className="mt-2 block text-xs text-muted">{label}</span>
      <span className="mt-0.5 block truncate text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}
