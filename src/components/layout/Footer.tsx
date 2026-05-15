import { Car } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="mt-auto bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
              <Car className="h-5 w-5 text-primary" />
              <span>AutoPrime</span>
            </Link>
            <p className="mt-3 text-sm text-gray-400">
              Sua concessionária de confiança. Os melhores veículos com as melhores condições.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Navegação</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/carros" className="hover:text-white transition-colors">Carros</Link></li>
              <li><Link href="/institucional" className="hover:text-white transition-colors">Institucional</Link></li>
              <li><Link href="/contato" className="hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Serviços</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/financiamento" className="hover:text-white transition-colors">Financiamento</Link></li>
              <li><Link href="/vender" className="hover:text-white transition-colors">Vender meu carro</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Dúvidas frequentes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} AutoPrime. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
