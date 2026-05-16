import Link from "next/link"
import { ArrowRight, Car, CreditCard, Shield } from "lucide-react"

const cards = [
  {
    title: "Comprar com orientação",
    description: "Compare modelos e fale com a loja antes de assumir qualquer compromisso.",
    href: "/carros",
    action: "Ver opções",
    icon: Car,
    gradient: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Financiar com clareza",
    description: "Entenda entrada, prazo e condições antes de avançar na proposta.",
    href: "/financiamento",
    action: "Simular",
    icon: CreditCard,
    gradient: "from-blue-500 to-sky-600",
    lightBg: "bg-blue-50",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    title: "Vender com segurança",
    description: "Solicite avaliação e siga por um processo mais reservado e organizado.",
    href: "/vender",
    action: "Avaliar",
    icon: Shield,
    gradient: "from-violet-500 to-violet-600",
    lightBg: "bg-violet-50",
    iconBg: "bg-violet-100 text-violet-600",
  },
]

export default function PathwayCards() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
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
              className="group relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full opacity-5 ${card.lightBg}`}
              />
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} transition-colors group-hover:bg-gradient-to-br group-hover:text-white ${card.gradient}`}
              >
                <card.icon className="h-6 w-6" />
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
