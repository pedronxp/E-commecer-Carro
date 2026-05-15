import type { Metadata } from "next"
import { Button } from "@/components/ui/Button"
import { CheckCircle, Percent, CalendarDays, CreditCard } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Financiamento - AutoPrime",
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
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Financiamento</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Realize o sonho do carro próprio com condições especiais e aprovação facilitada.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            <Button className="w-full">
              Simular
            </Button>
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
  )
}
