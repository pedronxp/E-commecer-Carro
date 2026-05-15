import type { Metadata } from "next"
import Link from "next/link"
import { CalendarDays, CheckCircle, CreditCard, Percent } from "lucide-react"
import ImagePageHero from "@/components/marketing/ImagePageHero"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Financiamento - Lima Automóveis",
  description: "Simule seu financiamento de veículo com as melhores taxas do mercado.",
}

const benefits = [
  { icon: Percent, title: "Taxas especiais", text: "A partir de 0,99% ao mês" },
  { icon: CalendarDays, title: "Até 60 parcelas", text: "Prazo que cabe no seu bolso" },
  { icon: CreditCard, title: "Aprovação rápida", text: "Crédito aprovado em até 24h" },
  { icon: CheckCircle, title: "Sem entrada", text: "Financie 100% do valor" },
]

export default function FinanciamentoPage() {
  return (
    <>
      <ImagePageHero
        eyebrow="Crédito automotivo"
        title="Financiamento com aprovação clara e sem pressa"
        description="Simule parcelas, entrada e prazo antes de escolher o veículo. A imagem de apoio foi gerada sem marcas, placas ou modelos reais reconhecíveis."
        imageSrc="/images/banners/financing-safe.png"
        imageAlt="Entrega fictícia de chaves e documentos de financiamento sem marcas ou pessoas identificáveis"
      >
        <Link href="/carros">
          <Button size="lg">Ver veículos</Button>
        </Link>
        <Link href="/contato">
          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
            Falar com consultor
          </Button>
        </Link>
      </ImagePageHero>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Simule seu financiamento</h2>
          <form className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Valor do veículo</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="R$ 80.000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Entrada</label>
              <input
                type="number"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="R$ 20.000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Prazo (meses)</label>
              <select className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none">
                <option>24 meses</option>
                <option>36 meses</option>
                <option>48 meses</option>
                <option>60 meses</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Simular</Button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-muted">
          Consulte nossas condições. Taxas sujeitas a aprovação de crédito.
          <Link href="/contato" className="ml-1 text-primary hover:underline">
            Fale conosco para mais informações.
          </Link>
        </div>
      </div>
    </>
  )
}
