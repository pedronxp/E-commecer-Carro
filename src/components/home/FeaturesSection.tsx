import { Award, Clock, CreditCard, Headphones, Shield, Wrench } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Procedência garantida",
    description: "Histórico conferido e avaliação criteriosa antes de qualquer negociação.",
  },
  {
    icon: CreditCard,
    title: "Financiamento facilitado",
    description: "Simulação clara, opções de entrada e acompanhamento da proposta até a aprovação.",
  },
  {
    icon: Headphones,
    title: "Atendimento consultivo",
    description: "Orientação direta para comparar modelos, valores e condições sem pressão.",
  },
  {
    icon: Clock,
    title: "Processo ágil",
    description: "Etapas organizadas para reduzir espera e retrabalho em cada etapa.",
  },
  {
    icon: Wrench,
    title: "Entrega preparada",
    description: "Conferência completa antes da retirada ou envio do veículo.",
  },
  {
    icon: Award,
    title: "Suporte pós-venda",
    description: "Acompanhamento após a compra para manter tudo em ordem.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
            Diferenciais
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            O que sustenta a experiência
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Menos promessa solta, mais etapas claras para você comprar, financiar ou vender com previsibilidade.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
