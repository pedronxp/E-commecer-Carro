"use client"

import { Camera, Mail, Phone } from "lucide-react"
import Link from "next/link"
import BrandLogo from "@/components/layout/BrandLogo"

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/carros", label: "Carros" },
  { href: "/financiamento", label: "Financiamento" },
  { href: "/vender", label: "Vender" },
  { href: "/contato", label: "Contato" },
]

const supportLinks = [
  { href: "/faq", label: "Dúvidas frequentes" },
  { href: "/termos", label: "Termos" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/lgpd", label: "LGPD" },
]

export default function Footer() {
  return (
    <footer className="mt-auto bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-start lg:gap-10">
          <div>
            <Link href="/" className="inline-flex items-center text-white">
              <BrandLogo tone="light" />
            </Link>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
              Compra, venda e financiamento de veículos com atendimento direto e processo transparente.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
              <a href="tel:+5500000000000" className="inline-flex items-center gap-2 transition-colors hover:text-white">
                <Phone className="h-4 w-4 text-primary" />
                (00) 00000-0000
              </a>
              <a href="mailto:contato@limaautomoveis.com.br" className="inline-flex items-center gap-2 transition-colors hover:text-white">
                <Mail className="h-4 w-4 text-primary" />
                contato@limaautomoveis.com.br
              </a>
              <a href="https://www.instagram.com/" className="inline-flex items-center gap-2 transition-colors hover:text-white">
                <Camera className="h-4 w-4 text-primary" />
                Instagram
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-300">
              Navegação
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 lg:max-w-56">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-300">
              Suporte
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 lg:max-w-52">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("lima:open-cookie-preferences"))}
                  className="text-left transition-colors hover:text-white"
                >
                  Cookies
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Lima Automóveis. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
