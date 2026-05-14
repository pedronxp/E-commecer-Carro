import { Car } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <Car className="h-5 w-5 text-primary" />
            <span>
              <span className="text-primary">Happy</span>Rocket
            </span>
          </Link>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} HappyRocket. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
