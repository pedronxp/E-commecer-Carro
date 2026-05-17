import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"

export default function CTASection() {
  return (
    <section className="bg-background px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="home-cta-panel relative overflow-hidden rounded-xl border border-white/10 bg-secondary px-6 py-10 text-white shadow-lg sm:px-10 sm:py-12 lg:px-14">
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">Próximo passo</p>
              <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                Fale com a equipe e encontre o próximo carro com mais segurança.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Consulte modelos disponíveis, simule condições de pagamento ou solicite uma avaliação do seu veículo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/carros"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl active:scale-[0.98]"
              >
                Ver catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contato"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/8 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-[0.98]"
              >
                <Phone className="h-5 w-5" />
                Entrar em contato
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
