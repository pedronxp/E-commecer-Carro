"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"

const slides = [
  {
    title: "Encontre seu próximo carro na Lima Automóveis.",
    description:
      "Veja os carros disponíveis, compare os detalhes principais e chame a loja no WhatsApp para confirmar disponibilidade, visita e negociação.",
    primary: { href: "/carros", label: "Ver carros disponíveis" },
    secondary: { href: "/contato", label: "Falar no WhatsApp" },
    note: "Catálogo da loja",
  },
  {
    title: "Gostou de um modelo? Fale direto com a loja.",
    description:
      "Pergunte sobre fotos, estado do veículo, documentação, troca e condições antes de sair de casa. O atendimento continua pelo WhatsApp.",
    primary: { href: "/carros", label: "Abrir catálogo" },
    secondary: { href: "/contato", label: "Chamar atendimento" },
    note: "Atendimento direto",
  },
  {
    title: "Quer vender ou trocar? Comece pelo atendimento.",
    description:
      "Envie modelo, ano, quilometragem e fotos do seu carro. A equipe responde pelo WhatsApp e orienta se vale compra, troca ou consignação.",
    primary: { href: "/vender", label: "Enviar meu carro" },
    secondary: { href: "/contato", label: "Falar com a loja" },
    note: "Venda e troca",
  },
]

const trustPoints = ["Catálogo atualizado", "Atendimento via WhatsApp", "Compra, venda e troca"]

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
      className="relative isolate overflow-hidden bg-slate-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Image
        src="/images/banners/home-hero-safe.png"
        alt="Showroom Lima Automóveis com veículos selecionados"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center] opacity-50"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.93),rgba(2,6,23,0.74)_54%,rgba(2,6,23,0.30))]" />

      <div className="relative mx-auto grid min-h-[540px] max-w-7xl content-center gap-10 px-4 py-16 sm:min-h-[600px] sm:px-6 lg:min-h-[640px] lg:grid-cols-[1fr_340px] lg:px-8 lg:py-20">
        <div key={current} className="max-w-2xl" style={{ animation: "fade-in 0.5s ease-out" }}>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100 sm:text-sm">
            <MessageCircle className="h-3.5 w-3.5" />
            {slide.note}
          </span>
          <h1 className="mt-3 text-[2rem] font-black leading-[1.04] tracking-tight text-white sm:text-4xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200 lg:text-lg">
            {slide.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            {trustPoints.map((point) => (
              <span
                key={point}
                className="rounded-full border border-white/14 bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur"
              >
                {point}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={slide.primary.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
            >
              {slide.primary.label}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href={slide.secondary.href}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/20 bg-white/8 px-6 py-3 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.98]"
            >
              {slide.secondary.label}
            </Link>
          </div>
        </div>

        <div className="hidden self-center lg:flex lg:justify-end">
          <div className="w-full max-w-sm rounded-xl border border-white/12 bg-white/10 p-5 text-white backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-100">Atendimento da loja</p>
                <p className="mt-1 text-sm text-slate-300">Tire dúvidas antes de visitar.</p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={prev}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-slate-200 transition-colors hover:bg-white/10"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-slate-200 transition-colors hover:bg-white/10"
                  aria-label="Próximo slide"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4 pt-4 text-sm text-slate-200">
              <p>Escolha o modelo, confirme os detalhes e combine a visita pelo WhatsApp.</p>
              <p className="rounded-lg bg-white/10 p-4 text-base font-semibold leading-snug">
                Atendimento direto para disponibilidade, troca, visita e financiamento.
              </p>
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
