"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Car, ChevronLeft, ChevronRight, CreditCard, Shield, Sparkles } from "lucide-react"

const slides = [
  {
    title: "Seu próximo carro começa por uma escolha segura",
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
      className="relative isolate overflow-hidden bg-secondary text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Image
        src="/images/banners/home-hero-safe.png"
        alt="Carro premium em showroom moderno da Lima Automóveis"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[64%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(15,23,42,0.92)_0%,_rgba(15,23,42,0.74)_45%,_rgba(15,23,42,0.94)_100%)] lg:bg-[linear-gradient(90deg,_rgba(15,23,42,0.96)_0%,_rgba(15,23,42,0.88)_42%,_rgba(15,23,42,0.42)_74%,_rgba(15,23,42,0.20)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-secondary/60 to-transparent" />

      <div className="relative mx-auto grid min-h-[540px] max-w-7xl content-center gap-8 px-4 py-12 sm:min-h-[600px] sm:px-6 lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div key={current} className="max-w-3xl" style={{ animation: "fade-in 0.5s ease-out" }}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-sm sm:text-sm">
            <Sparkles className="h-4 w-4" />
            Lima Automóveis
          </div>
          <h1 className="max-w-[21rem] text-[2rem] font-bold leading-[1.08] sm:max-w-3xl sm:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-[21rem] text-sm leading-relaxed text-slate-200 sm:max-w-2xl sm:text-lg">
            {slide.description}
          </p>

          <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              href={slide.primary.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {slide.primary.label}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={slide.secondary.href}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              {slide.secondary.label}
            </Link>
          </div>
        </div>

        <div className="hidden self-end lg:block lg:self-center">
          <div className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-100">Atendimento rápido</p>
                <p className="mt-1 text-sm text-slate-200">Escolha o caminho e continue a navegação.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={prev}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white transition-colors hover:bg-white/10"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white transition-colors hover:bg-white/10"
                  aria-label="Próximo slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              {shortcuts.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/8 p-3 transition-colors hover:bg-white/14"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-emerald-100">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{item.label}</span>
                    <span className="block text-xs text-slate-300">{item.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
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
                idx === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
