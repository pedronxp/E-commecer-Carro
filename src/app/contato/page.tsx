import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contato - Lima Automóveis",
  description: "Fale com a Lima Automóveis pelo WhatsApp, telefone ou formulário.",
}

const contactInfo = [
  { title: "WhatsApp", text: "(11) 3000-0000", action: "Chamar agora", href: "https://wa.me/5500000000000" },
  { title: "Telefone", text: "(11) 3000-0000", action: "Ligar para a loja", href: "tel:+551130000000" },
  { title: "Endereço", text: "Av. Paulista, 1000 - São Paulo, SP" },
  { title: "Horário", text: "Seg. a sex.: 8h às 19h | Sáb.: 9h às 15h" },
]

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Atendimento</p>
        <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
          Fale com a Lima Automóveis.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Quer confirmar um carro do catálogo, falar sobre troca ou marcar uma visita? Chame a loja pelo WhatsApp
          e continue a conversa com atendimento direto.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contactInfo.map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            {item.href ? (
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
              >
                {item.action}
              </a>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.78fr_1fr]">
        <aside className="rounded-lg border border-border bg-surface p-6">
          <h2 className="text-xl font-semibold text-foreground">Antes de chamar</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            <p>Se você viu um carro no catálogo, envie o nome do modelo e o ano.</p>
            <p>Se for troca, informe também modelo, ano e quilometragem do seu veículo.</p>
            <p>Para visita, pergunte antes se o carro ainda está disponível.</p>
          </div>
          <Link href="/carros" className="mt-6 inline-flex text-sm font-semibold text-primary hover:text-primary-dark">
            Ver carros disponíveis
          </Link>
        </aside>

        <div className="rounded-lg border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-foreground">Enviar mensagem</h2>
          <p className="mt-2 text-sm text-muted">
            Escreva o assunto de forma simples. A loja usa essas informações para responder melhor.
          </p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Nome</label>
              <input
                type="text"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">WhatsApp ou telefone</label>
              <input
                type="text"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Mensagem</label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
                placeholder="Ex: Tenho interesse no Civic 2020. Ele ainda está disponível?"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Enviar mensagem
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
