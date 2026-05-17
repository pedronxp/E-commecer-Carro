import Link from "next/link"
import { MessageCircle } from "lucide-react"

const serviceSteps = [
  {
    title: "Escolha pelo catálogo",
    description: "Veja fotos, ano, versão, câmbio, combustível e valor anunciado antes de chamar a loja.",
  },
  {
    title: "Confirme pelo WhatsApp",
    description: "Pergunte se o carro ainda está disponível, tire dúvidas e combine o melhor horário para ver o veículo.",
  },
  {
    title: "Fale sobre troca ou entrada",
    description: "Se quiser usar seu carro no negócio, envie os dados básicos e continue a conversa com o atendimento.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="border-y border-border bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <div className="max-w-xl">
          <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
            Atendimento da loja
          </span>
          <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Gostou de um carro? A conversa continua pelo WhatsApp.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            O site mostra o estoque e ajuda você a chegar no atendimento já sabendo qual veículo quer ver. A equipe
            confirma disponibilidade, fotos, visita, troca e próximos passos direto pelo WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/carros"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition-all hover:border-primary/30 hover:text-primary"
            >
              Ver carros disponíveis
            </Link>
            <Link
              href="/contato"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark"
            >
              <MessageCircle className="h-4 w-4" />
              Chamar no WhatsApp
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {serviceSteps.map((step, index) => (
            <div
              key={step.title}
              className="min-h-[190px] rounded-xl border border-border bg-slate-50 p-5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <span className="text-xs font-black uppercase tracking-[0.16em] text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 text-lg font-black leading-tight text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
