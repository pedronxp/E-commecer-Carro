const stats = [
  { value: "500+", label: "Veículos em estoque" },
  { value: "10k+", label: "Clientes satisfeitos" },
  { value: "15+", label: "Anos de experiência" },
  { value: "98%", label: "Aprovação em avaliações" },
]

export default function StatsSection() {
  return (
    <section className="bg-secondary py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-gray-400 sm:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
