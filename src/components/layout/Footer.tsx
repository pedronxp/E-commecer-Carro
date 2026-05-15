"use client"

import { useState } from "react"
import { Car, MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export default function Footer() {
  const [email, setEmail] = useState("")

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmail("")
  }

  return (
    <footer className="mt-auto bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Car className="h-4 w-4 text-white" />
              </div>
              <span>Lima Automóveis</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
              Sua concessionária de confiança. Os melhores veículos seminovos e novos com as melhores condições do mercado.
            </p>

            <div className="mt-6 space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Av. Principal, 1234 - Centro<br />Cidade - Estado, CEP 00000-000</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a href="tel:+5500000000000" className="hover:text-white transition-colors">
                  (00) 00000-0000
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a href="mailto:contato@limaautomoveis.com.br" className="hover:text-white transition-colors">
                  contato@limaautomoveis.com.br
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-primary" />
                <span>Seg-Sex: 8h-18h | Sáb: 8h-13h</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Navegação
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/carros" className="hover:text-white transition-colors">Carros</Link></li>
              <li><Link href="/financiamento" className="hover:text-white transition-colors">Financiamento</Link></li>
              <li><Link href="/vender" className="hover:text-white transition-colors">Vender meu carro</Link></li>
              <li><Link href="/institucional" className="hover:text-white transition-colors">Institucional</Link></li>
              <li><Link href="/contato" className="hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Suporte
            </h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">Dúvidas frequentes</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Política de privacidade</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">
              Newsletter
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Receba as melhores ofertas direto no seu e-mail.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <Button type="submit" size="sm" className="w-full">
                Inscrever-se
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Lima Automóveis. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
