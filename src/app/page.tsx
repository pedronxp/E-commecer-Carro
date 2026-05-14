import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CarCard from "@/components/CarCard";

export default async function Home() {
  const featuredCars = await prisma.car.findMany({
    where: { isFeatured: true, isSold: false },
    include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <section className="bg-zinc-900 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Encontre o carro dos seus sonhos
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
            Milhares de carros seminovos e novos com os melhores preços do mercado
          </p>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 bg-white text-zinc-900 px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors"
          >
            Ver todos os carros
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {featuredCars.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8">Carros em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
