import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const cards = [
  {
    title: "Comprar sem ficar rodando em anúncio solto",
    description:
      "Comece pelo estoque real da loja, filtre o que cabe no seu momento e avance só quando o veículo fizer sentido.",
    href: "/carros",
    action: "Ver carros disponíveis",
    media: "/images/icons/buy-flow.svg",
    meta: "Compra",
  },
  {
    title: "Entender pagamento antes da proposta",
    description:
      "Use a página de financiamento para organizar entrada, prazo e conversa com a equipe antes de fechar caminho.",
    href: "/financiamento",
    action: "Abrir financiamento",
    media: "/images/icons/finance-flow.svg",
    meta: "Crédito",
  },
  {
    title: "Vender, trocar ou consignar com mais controle",
    description:
      "Envie os dados principais do veículo e deixe a loja orientar o melhor formato de negociação para o seu caso.",
    href: "/vender",
    action: "Solicitar avaliação",
    media: "/images/icons/sell-flow.svg",
    meta: "Avaliação",
  },
]

export default function PathwayCards() {
  return (
    <section className="border-b border-border bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-4 lg:grid-cols-[0.82fr_1fr] lg:items-end">
          <div>
            <span className="inline-block rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Caminhos rápidos
            </span>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              O site precisa levar o cliente para a conversa certa
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted lg:justify-self-end">
            Compra, financiamento e avaliação têm dúvidas diferentes. Por isso a navegação separa cada intenção e evita jogar todo mundo no mesmo formulário.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-5 overflow-hidden rounded-lg border border-slate-800/10 bg-slate-950">
                <Image
                  src={card.media}
                  alt=""
                  width={160}
                  height={120}
                  className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {card.meta}
                </span>
                <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h3 className="text-lg font-semibold leading-tight text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-primary">
                {card.action}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
