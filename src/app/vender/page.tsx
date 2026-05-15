import type { Metadata } from "next"
import { Button } from "@/components/ui/Button"
import { ClipboardCheck, DollarSign, FileText, Truck } from "lucide-react"

export const metadata: Metadata = {
  title: "Vender Meu Carro - Lima Automóveis",
  description: "Venda seu carro para a Lima Automóveis. Avaliação justa e pagamento rápido.",
}

const steps = [
  { icon: FileText, title: "Cadastre seu veículo", text: "Preencha os dados do seu carro no formulário abaixo." },
  { icon: ClipboardCheck, title: "Avaliação gratuita", text: "Nossa equipe avalia e retorna com a melhor proposta." },
  { icon: DollarSign, title: "Proposta justa", text: "Pagamento à vista ou valor como entrada em outro veículo." },
  { icon: Truck, title: "Documentação resolvida", text: "Cuidamos de toda a parte burocrática para você." },
]

export default function VenderPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Vender Meu Carro</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Venda seu veículo de forma rápida, segura e com o melhor preço de mercado.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.title} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <step.icon className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {i + 1}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm text-muted">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Dados do veículo</h2>
        <form className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Modelo</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="Ex: Honda Civic EX 2.0"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Ano</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="2020"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Quilometragem</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="50.000"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Observações</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="Estado geral, opcionais, etc."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Seu melhor e-mail</label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <div className="sm:col-span-2">
            <Button className="w-full sm:w-auto">
              Solicitar avaliação
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
