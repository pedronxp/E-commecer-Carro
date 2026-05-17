import type { Metadata } from "next"
import Link from "next/link"
import { WhatsAppTrackedLink } from "@/components/commercial/CommercialTracker"
import ImagePageHero from "@/components/marketing/ImagePageHero"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
  title: "Financiamento - Lima Automóveis",
  description: "Organize entrada e prazo antes de conversar com a Lima Automóveis.",
}

const benefits = [
  { title: "Escolha o carro primeiro", text: "A conversa fica melhor quando você já tem um modelo ou faixa de preço em mente." },
  { title: "Separe uma entrada", text: "Informe quanto pretende dar de entrada para a loja orientar os próximos passos." },
  { title: "Pense na parcela", text: "Tenha uma faixa mensal confortável antes de seguir para análise." },
  { title: "Converse com atendimento", text: "Condições dependem de análise. O site ajuda a preparar a conversa, não promete aprovação." },
]

export default function FinanciamentoPage() {
  const whatsappMessage = "Tenho interesse em financiamento com a Lima Automoveis. Quero entender entrada, prazo e documentos.";

  return (
    <>
      <ImagePageHero
        eyebrow="Financiamento"
        title="Quer financiar? Comece escolhendo o carro."
        description="Veja o catálogo, escolha um modelo e fale com a loja sobre entrada, prazo e documentos. A equipe orienta o próximo passo conforme o seu perfil."
        imageSrc="/images/banners/financing-safe.png"
        imageAlt="Entrega fictícia de chaves e documentos de financiamento sem marcas ou pessoas identificáveis"
      >
        <Link href="/carros">
          <Button size="lg">Ver carros disponíveis</Button>
        </Link>
        <WhatsAppTrackedLink
          message={whatsappMessage}
          event={{
            type: "FINANCING_INTEREST",
            channel: "WHATSAPP",
            sourcePath: "/financiamento",
            ctaLabel: "Falar no WhatsApp",
            metadata: { placement: "hero" },
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-7 py-3.5 text-lg font-medium text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.97]"
        >
          Falar no WhatsApp
        </WhatsAppTrackedLink>
      </ImagePageHero>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => (
            <div key={item.title} className="rounded-lg border border-border bg-white p-5 shadow-sm">
              <span className="font-mono text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Simulação inicial</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Leve os numeros para a conversa</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Preencha uma ideia de valor, entrada e prazo. Isso não envia proposta automática; serve para organizar
              o atendimento com a loja.
            </p>
            <form className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Valor do veículo</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  placeholder="Ex: 80000"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Entrada disponível</label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                  placeholder="Ex: 20000"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Prazo desejado</label>
                <select className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none">
                  <option>24 meses</option>
                  <option>36 meses</option>
                  <option>48 meses</option>
                  <option>60 meses</option>
                </select>
              </div>
              <div className="flex items-end">
                <WhatsAppTrackedLink
                  message={whatsappMessage}
                  event={{
                    type: "FINANCING_INTEREST",
                    channel: "WHATSAPP",
                    sourcePath: "/financiamento",
                    ctaLabel: "Preparar atendimento",
                    metadata: { placement: "simulation" },
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-base font-medium text-white transition-all duration-200 hover:bg-primary-dark active:scale-[0.97]"
                >
                  Preparar atendimento
                </WhatsAppTrackedLink>
              </div>
            </form>
          </div>

          <aside className="rounded-lg border border-border bg-surface p-6">
            <h3 className="text-lg font-semibold text-foreground">Para falar no WhatsApp</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              <li>Envie o link ou nome do carro que você gostou.</li>
              <li>Diga quanto pretende dar de entrada.</li>
              <li>Informe se tem carro para troca.</li>
              <li>Pergunte quais documentos separar.</li>
            </ul>
            <WhatsAppTrackedLink
              message={whatsappMessage}
              event={{
                type: "FINANCING_INTEREST",
                channel: "WHATSAPP",
                sourcePath: "/financiamento",
                ctaLabel: "Chamar atendimento",
                metadata: { placement: "aside" },
              }}
              className="mt-6 inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Chamar atendimento
            </WhatsAppTrackedLink>
          </aside>
        </div>
      </div>
    </>
  )
}
