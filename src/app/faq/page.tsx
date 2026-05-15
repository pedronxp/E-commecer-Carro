import type { Metadata } from "next"
import { ChevronDown } from "lucide-react"

export const metadata: Metadata = {
  title: "FAQ - AutoPrime",
  description: "Dúvidas frequentes sobre compra, financiamento e venda de veículos na AutoPrime.",
}

const faqs = [
  {
    q: "Como funciona o financiamento?",
    a: "Você escolhe o veículo, preenche uma simulação em nosso site e nossa equipe entra em contato para aprovação. Trabalhamos com as principais instituições financeiras para oferecer as melhores taxas.",
  },
  {
    q: "Quais documentos preciso para comprar?",
    a: "RG, CPF, comprovante de residência e comprovante de renda. Para financiamento, podem ser solicitados documentos adicionais.",
  },
  {
    q: "Os veículos têm garantia?",
    a: "Sim. Todos os veículos comercializados pela AutoPrime têm garantia conforme previsto em lei e podem ser estendidos mediante contrato.",
  },
  {
    q: "Como funciona a venda do meu carro?",
    a: "Você cadastra seu veículo em nosso site, nossa equipe faz uma avaliação e apresenta uma proposta. Se aceita, realizamos o pagamento à vista ou damos o valor como entrada em outro veículo.",
  },
  {
    q: "É possível fazer test drive?",
    a: "Sim. Agende uma visita em nosso endereço ou entre em contato pelo telefone (11) 3000-0000 para agendar o test drive do veículo desejado.",
  },
  {
    q: "Vocês aceitam meu carro como entrada?",
    a: "Sim. Avaliamos seu veículo usado e o valor é descontado do veículo novo. É uma das formas mais comuns de negociação.",
  },
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Dúvidas Frequentes</h1>
        <p className="mt-4 text-lg text-muted">
          Tire suas principais dúvidas sobre nossos serviços.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        {faqs.map((faq, i) => (
          <details key={i} className="group rounded-xl border border-gray-100 bg-white shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-foreground">
              {faq.q}
              <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-gray-100 px-6 py-4 text-sm text-muted leading-relaxed">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
