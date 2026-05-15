import type { Metadata } from "next"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contato - AutoPrime",
  description: "Entre em contato com a AutoPrime. Tire suas dúvidas ou agende uma visita.",
}

const contactInfo = [
  { icon: Phone, title: "Telefone", text: "(11) 3000-0000" },
  { icon: Mail, title: "E-mail", text: "contato@autoprime.com.br" },
  { icon: MapPin, title: "Endereço", text: "Av. Paulista, 1000 - São Paulo, SP" },
  { icon: Clock, title: "Horário", text: "Seg a Sex: 8h às 19h | Sáb: 9h às 15h" },
]

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Fale Conosco</h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Estamos prontos para atender você. Escolha o canal de sua preferência.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {contactInfo.map((item) => (
          <div key={item.title} className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <item.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Envie sua mensagem</h2>
        <form className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Nome</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">E-mail</label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-foreground">Mensagem</label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              placeholder="Digite sua mensagem..."
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Enviar mensagem
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
