import { Car } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <Car className="mb-4 h-16 w-16 text-muted" />
      <h1 className="text-3xl font-bold text-foreground">Página não encontrada</h1>
      <p className="mt-2 text-muted">A página que você procura não existe ou foi removida.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
