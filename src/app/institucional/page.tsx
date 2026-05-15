import type { Metadata } from "next"
import { Shield, Users, Award, Heart } from "lucide-react"

export const metadata: Metadata = {
  title: "Institucional - AutoPrime",
  description: "Conheça a história e os valores da AutoPrime.",
}

const values = [
  { icon: Shield, title: "Confiança", text: "Mais de 15 anos de mercado com milhares de clientes satisfeitos." },
  { icon: Users, title: "Atendimento", text: "Equipe dedicada para oferecer a melhor experiência na compra do seu veículo." },
  { icon: Award, title: "Qualidade", text: "Todos os veículos passam por rigorosa inspeção antes de serem comercializados." },
  { icon: Heart, title: "Transparência", text: "Condições claras, sem letras miúdas. Você sabe exatamente o que está comprando." },
]

export default function InstitucionalPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Sobre a AutoPrime</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Referência no mercado automotivo, a AutoPrime oferece veículos seminovos e novos com procedência,
          garantia e as melhores condições de pagamento.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {values.map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl bg-secondary p-8 text-center text-white sm:p-12">
        <h2 className="text-2xl font-bold">Números que nos definem</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-primary">+15</p>
            <p className="mt-1 text-sm text-gray-400">Anos de mercado</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">+5.000</p>
            <p className="mt-1 text-sm text-gray-400">Veículos vendidos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">98%</p>
            <p className="mt-1 text-sm text-gray-400">Clientes satisfeitos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
