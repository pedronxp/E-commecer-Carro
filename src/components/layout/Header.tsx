"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Menu, X, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import BrandLogo from "@/components/layout/BrandLogo"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/carros", label: "Carros" },
  { href: "/financiamento", label: "Financiamento" },
  { href: "/vender", label: "Vender" },
  { href: "/institucional", label: "Institucional" },
  { href: "/contato", label: "Contato" },
  { href: "/faq", label: "FAQ" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 shadow-md backdrop-blur-md"
          : "bg-white shadow-sm"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center text-secondary transition-transform duration-300 hover:scale-[1.02]"
          >
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-muted hover:text-foreground hover:bg-surface"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="tel:+5500000000000"
              className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden xl:inline">(00) 00000-0000</span>
            </a>
            <Link
              href="/carros"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-primary transition-colors"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/financiamento"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark hover:shadow-md"
            >
              Financiamento
            </Link>
          </div>

          <button
            className="flex items-center justify-center rounded-lg p-2 text-muted hover:bg-surface lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="overflow-hidden border-t border-border lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/5 text-primary"
                    : "text-muted hover:bg-surface hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <a
                href="tel:+5500000000000"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface"
              >
                <Phone className="h-4 w-4" />
                (00) 00000-0000
              </a>
              <Link
                href="/financiamento"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Simular Financiamento
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
