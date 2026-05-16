import Link from "next/link"
import { ArrowRight, Car, CreditCard, Shield } from "lucide-react"

const cards = [
  {
    title: "Comprar com orientação",
    description: "Compare modelos e fale com a loja antes de assumir qualquer compromisso.",
    href: "/carros",
    action: "Ver opções",
    icon: Car,
  },
  {
    title: "Financiar com clareza",
    description: "Entenda entrada, prazo e condições antes de avançar na proposta.",
    href: "/financiamento",
    action: "Simular",
    icon: CreditCard,
  },
  {
    title: "Vender com segurança",
    description: "Solicite avaliação e siga por um processo mais reservado e organizado.",
    href: "/vender",
    action: "Avaliar",
    icon: Shield,
  },
]

export default function DecisionSection() {
  return (
    <section className="bg-white px-4 py-9 sm:px-6 sm:py-11 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Escolha por objetivo</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
              O caminho certo para cada momento
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-relaxed text-muted">
            A home deixa claro o que a pessoa pode resolver agora, sem depender de menus ou textos longos.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-lg border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted">{card.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {card.action}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
