import { Shield, CreditCard, Car, Headphones, Clock, Award } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Procedência Garantida",
    description: "Todos os veículos passam por rigorosa inspeção de qualidade e histórico verificado.",
  },
  {
    icon: CreditCard,
    title: "Financiamento Facilitado",
    description: "Parcele em até 60x com as melhores taxas do mercado e aprovação rápida.",
  },
  {
    icon: Car,
    title: "Test Drive Grátis",
    description: "Agende um test drive sem compromisso e conheça o veículo antes de decidir.",
  },
  {
    icon: Headphones,
    title: "Atendimento Personalizado",
    description: "Nossa equipe está pronta para ajudar você a encontrar o carro ideal.",
  },
  {
    icon: Clock,
    title: "Processo Rápido",
    description: "Documentação e transferência ágeis para você sair dirigindo logo.",
  },
  {
    icon: Award,
    title: "Garantia de Fábrica",
    description: "Veículos com garantia inclusa para sua tranquilidade e segurança.",
  },
]

export default function FeaturesSection() {
  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Por que escolher a Lima Automóveis?
          </h2>
          <p className="mt-3 text-muted">
            Oferecemos a melhor experiência na compra do seu veículo, com segurança, transparência e as melhores condições.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-xl border border-border bg-white p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
