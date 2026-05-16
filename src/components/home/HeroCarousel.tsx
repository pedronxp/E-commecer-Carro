"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Car, ChevronLeft, ChevronRight, CreditCard, Shield } from "lucide-react"

const slides = [
  {
    title: "Seu próximo carro começa com uma escolha segura",
    description:
      "Modelos selecionados, atendimento direto e caminhos claros para comprar, financiar ou vender seu veículo.",
    primary: { href: "/carros", label: "Ver veículos" },
    secondary: { href: "/vender", label: "Avaliar meu carro" },
  },
  {
    title: "Financiamento com conversa objetiva",
    description:
      "Simule condições, compare opções de entrada e siga com uma proposta bem explicada pela equipe.",
    primary: { href: "/financiamento", label: "Simular financiamento" },
    secondary: { href: "/carros", label: "Ver estoque" },
  },
  {
    title: "Venda seu carro com mais previsibilidade",
    description:
      "Envie os dados do veículo, receba orientação de avaliação e avance sem exposição desnecessária.",
    primary: { href: "/vender", label: "Começar avaliação" },
    secondary: { href: "/contato", label: "Falar com a loja" },
  },
]

const shortcuts = [
  { href: "/carros", icon: Car, label: "Comprar", description: "Ver estoque selecionado" },
  { href: "/financiamento", icon: CreditCard, label: "Financiar", description: "Simular condições" },
  { href: "/vender", icon: Shield, label: "Vender", description: "Solicitar avaliação" },
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
    const timer = setInterval(next, 6500)
    return () => clearInterval(timer)
  }, [next, isPaused])

  const slide = slides[current]

  return (
    <section
      className="relative isolate overflow-hidden bg-gradient-to-br from-secondary via-[#1a2744] to-secondary"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Image
        src="/images/banners/home-hero-safe.png"
        alt="Showroom Lima Automóveis com veículos selecionados"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[64%_center] opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/40" />

      <div className="relative mx-auto grid min-h-[520px] max-w-7xl content-center gap-10 px-4 py-16 sm:min-h-[580px] sm:px-6 lg:min-h-[620px] lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
        <div key={current} className="max-w-2xl" style={{ animation: "fade-in 0.5s ease-out" }}>
          <span className="mb-4 inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300 sm:text-sm">
            Lima Automóveis
          </span>
          <h1 className="mt-3 text-[1.75rem] font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 sm:text-base lg:text-lg">
            {slide.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={slide.primary.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
            >
              {slide.primary.label}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={slide.secondary.href}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 bg-white/8 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.98]"
            >
              {slide.secondary.label}
            </Link>
          </div>
        </div>

        <div className="hidden self-center lg:block">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/8 shadow-2xl shadow-black/20 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Acesso rápido
                </p>
                <p className="mt-0.5 text-xs text-slate-400">Escolha o caminho desejado</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={prev}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Próximo slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-1 p-2">
              {shortcuts.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-white/8"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-emerald-300">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{item.label}</span>
                    <span className="block text-xs text-slate-400">{item.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === current ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
