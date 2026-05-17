import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Institucional - Lima Automóveis",
  description: "Conheça a Lima Automóveis e a forma de atendimento da loja.",
}

const values = [
  { title: "Catálogo claro", text: "Carros organizados com fotos, preço e informações principais para facilitar a escolha." },
  { title: "Atendimento direto", text: "O cliente fala com a loja para confirmar disponibilidade, visita, troca e financiamento." },
  { title: "Negociação sem rodeio", text: "A conversa parte do carro que o cliente escolheu e do que ele realmente precisa resolver." },
  { title: "Compra, venda e troca", text: "A mesma loja atende quem quer comprar, vender, trocar ou deixar o veículo em consignação." },
]

export default function InstitucionalPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Sobre a loja</p>
        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
          Lima Automóveis: catálogo, atendimento e negociação no mesmo lugar.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          O site existe para aproximar o cliente da loja. Você vê os carros, separa as opções que fazem sentido e
          chama o atendimento para confirmar detalhes antes de visitar.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {values.map((item, index) => (
          <div key={item.title} className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <span className="font-mono text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-secondary p-8 text-white sm:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">Como atendemos</p>
            <h2 className="mt-3 text-2xl font-bold">Escolha o carro no catálogo e continue pelo WhatsApp.</h2>
          </div>
          <div>
            <p className="text-sm leading-relaxed text-slate-300">
              Para compra, troca, venda ou financiamento, o atendimento começa melhor quando o cliente já chega com
              uma referência: modelo, ano, preço e dúvida principal.
            </p>
            <Link href="/contato" className="mt-5 inline-flex text-sm font-semibold text-primary-light hover:text-white">
              Falar com a loja
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
