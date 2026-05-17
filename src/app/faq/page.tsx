import type { Metadata } from "next"
import { ChevronDown } from "lucide-react"

export const metadata: Metadata = {
  title: "FAQ - Lima Automóveis",
  description: "Dúvidas frequentes sobre compra, financiamento, venda, troca e consignação de veículos.",
}

const faqs = [
  {
    q: "Como confirmo se um carro ainda está disponível?",
    a: "Abra o carro no catálogo e fale com a loja pelo WhatsApp. A equipe confirma disponibilidade, detalhes e horário para visita.",
  },
  {
    q: "Posso perguntar pelo WhatsApp antes de visitar?",
    a: "Pode. Envie o nome do carro, ano ou link do anúncio. Se quiser trocar, mande também os dados do seu veículo.",
  },
  {
    q: "A loja aceita carro na troca?",
    a: "A Lima Automóveis pode avaliar venda direta, troca ou consignação. Envie modelo, ano, quilometragem e fotos quando o atendimento solicitar.",
  },
  {
    q: "O financiamento é aprovado pelo site?",
    a: "Não. O site ajuda a organizar entrada, prazo e documentos. Condições dependem de análise e retorno do atendimento.",
  },
  {
    q: "Dá para marcar visita ou test drive?",
    a: "Sim. Primeiro confirme pelo atendimento se o veículo está disponível e combine o melhor horário com a loja.",
  },
  {
    q: "O que devo enviar para agilizar o atendimento?",
    a: "Nome do carro, sua dúvida principal, se tem troca e o melhor horário para retorno.",
  },
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Dúvidas frequentes</p>
        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">Antes de chamar a loja</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Respostas simples para quem quer comprar, trocar, vender ou falar sobre financiamento.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group rounded-lg border border-border bg-white shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-foreground">
              {faq.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
