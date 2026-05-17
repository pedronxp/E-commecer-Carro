import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"

export default function CTASection() {
  return (
    <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.20),transparent_60%)] lg:block" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">Atendimento</p>
              <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                Quer ver um carro de perto? Chame a Lima Automóveis.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Mande uma mensagem com o modelo que gostou. A loja confirma disponibilidade, passa mais detalhes e
                combina visita ou negociação pelo WhatsApp.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contato"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" />
                Chamar no WhatsApp
              </Link>
              <Link
                href="/carros"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/8 px-6 py-3 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.98]"
              >
                Ver catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
