import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Empresário",
    content: "Excelente atendimento! Encontrei o carro perfeito em menos de uma hora. O processo de financiamento foi rápido e sem burocracia.",
    rating: 5,
  },
  {
    name: "Ana Oliveira",
    role: "Professora",
    content: "Estava com medo de comprar um carro usado, mas a Lima Automóveis me deixou super tranquila. Veículo em perfeito estado!",
    rating: 5,
  },
  {
    name: "Roberto Santos",
    role: "Engenheiro",
    content: "Já é o segundo carro que compro aqui. Confiança total na procedência dos veículos e nas condições oferecidas.",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            O que nossos clientes dizem
          </h2>
          <p className="mt-3 text-muted">
            A satisfação dos nossos clientes é o nosso maior orgulho.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="relative rounded-xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <Quote className="mb-4 h-8 w-8 text-primary/20" />
              <p className="text-sm leading-relaxed text-muted">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-xs text-muted">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
