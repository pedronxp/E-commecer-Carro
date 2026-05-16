import Link from "next/link"
import { ArrowRight, Phone, ShieldCheck } from "lucide-react"

export default function CTASection() {
  return (
    <section className="bg-white px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="home-cta-panel overflow-hidden rounded-lg border border-primary/20 bg-secondary p-5 text-white shadow-lg sm:p-7 lg:p-8">
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-emerald-100 sm:text-sm">
              <ShieldCheck className="h-4 w-4" />
              Atendimento especializado
            </div>
            <h2 className="max-w-2xl text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Fale com a equipe e encontre o próximo carro com mais segurança.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Consulte modelos disponíveis, simule condições de pagamento ou solicite uma avaliação do seu veículo.
            </p>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                href="/carros"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Ver catálogo
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="tel:+5500000000000"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/20 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Phone className="h-5 w-5" />
                Ligar agora
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
