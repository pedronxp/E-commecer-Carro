"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"

const slides = [
  {
    title: "Encontre o carro",
    highlight: "ideal para você",
    description: "Os melhores veículos com condições imperdíveis. Financiamento aprovado na hora e entrega em todo Brasil.",
    badge: "Catálogo exclusivo com mais de 500 veículos",
    ctaPrimary: { href: "/carros", label: "Ver Catálogo" },
    ctaSecondary: { href: "/financiamento", label: "Simular Financiamento" },
    gradient: "from-emerald-700 via-emerald-600 to-secondary",
    accentColor: "text-emerald-300",
    badgeIcon: <Sparkles className="h-4 w-4 text-emerald-300" />,
  },
  {
    title: "Financiamento",
    highlight: "facilitado",
    description: "Parcele em até 60x com as melhores taxas do mercado. Aprovação rápida e sem burocracia.",
    badge: "Taxas a partir de 0,99% ao mês",
    ctaPrimary: { href: "/financiamento", label: "Simular Agora" },
    ctaSecondary: { href: "/carros", label: "Ver Veículos" },
    gradient: "from-sky-700 via-sky-600 to-secondary",
    accentColor: "text-sky-300",
    badgeIcon: <Sparkles className="h-4 w-4 text-sky-300" />,
  },
  {
    title: "Venda seu carro",
    highlight: "com segurança",
    description: "Avaliação gratuita e pagamento à vista. Processo rápido e transparente.",
    badge: "Avaliação em até 30 minutos",
    ctaPrimary: { href: "/vender", label: "Avaliar Meu Carro" },
    ctaSecondary: { href: "/contato", label: "Fale Conosco" },
    gradient: "from-violet-700 via-violet-600 to-secondary",
    accentColor: "text-violet-300",
    badgeIcon: <Sparkles className="h-4 w-4 text-violet-300" />,
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, isPaused])

  const slide = slides[current]

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-br ${slide.gradient} px-4 py-24 text-white sm:py-32`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <div className="relative mx-auto max-w-7xl">
        <div key={current} className="max-w-2xl" style={{ animation: "fade-in 0.5s ease-out" }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            {slide.badgeIcon}
            {slide.badge}
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {slide.title} <br />
            <span className={slide.accentColor}>{slide.highlight}</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
            {slide.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={slide.ctaPrimary.href}>
              <Button size="lg" className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                {slide.ctaPrimary.label}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href={slide.ctaSecondary.href}>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                {slide.ctaSecondary.label}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Ir para slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
