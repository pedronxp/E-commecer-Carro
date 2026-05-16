import { Award, Clock, CreditCard, Headphones, Shield, Wrench } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Procedência garantida",
    description: "Histórico conferido e avaliação criteriosa antes da negociação.",
  },
  {
    icon: CreditCard,
    title: "Financiamento facilitado",
    description: "Simulação clara, opções de entrada e acompanhamento da proposta.",
  },
  {
    icon: Headphones,
    title: "Atendimento consultivo",
    description: "Orientação direta para comparar modelos, valores e condições.",
  },
  {
    icon: Clock,
    title: "Processo ágil",
    description: "Etapas organizadas para reduzir espera e retrabalho.",
  },
  {
    icon: Wrench,
    title: "Entrega preparada",
    description: "Conferência final antes da retirada ou envio do veículo.",
  },
  {
    icon: Award,
    title: "Suporte pós-venda",
    description: "Acompanhamento após a compra para manter tudo bem encaminhado.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-surface py-9 sm:py-11">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              O que sustenta a experiência
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Menos promessa solta, mais etapas claras para você comprar, financiar ou vender com previsibilidade.
            </p>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Atendimento pensado para reduzir dúvida e acelerar decisão.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-lg border border-border bg-white p-4 transition-all duration-300 hover:border-primary/25 hover:shadow-md"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
