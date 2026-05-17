import Link from "next/link"
import { ArrowRight, Car, CreditCard, Shield } from "lucide-react"

const cards = [
  {
    title: "Comprar com orientação",
    description: "Compare modelos e fale com a loja antes de assumir qualquer compromisso.",
    href: "/carros",
    action: "Ver opções",
    icon: Car,
    meta: "Estoque",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    title: "Financiar com clareza",
    description: "Entenda entrada, prazo e condições antes de avançar na proposta.",
    href: "/financiamento",
    action: "Simular",
    icon: CreditCard,
    meta: "Crédito",
    iconBg: "bg-sky-50 text-sky-700",
  },
  {
    title: "Vender com segurança",
    description: "Solicite avaliação e siga por um processo mais reservado e organizado.",
    href: "/vender",
    action: "Avaliar",
    icon: Shield,
    meta: "Avaliação",
    iconBg: "bg-amber-50 text-amber-700",
  },
]

export default function PathwayCards() {
  return (
    <section className="border-b border-border bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="inline-block rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Caminhos rápidos
          </span>
          <h2 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            O que você precisa fazer hoje?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Escolha o caminho certo para comprar, financiar ou vender seu veículo com transparência.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-primary opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border border-border ${card.iconBg}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {card.meta}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
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
