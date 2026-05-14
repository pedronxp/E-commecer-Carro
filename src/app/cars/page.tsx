import { prisma } from "@/lib/prisma";
import CarCard from "@/components/CarCard";
import SearchFilters from "@/components/SearchFilters";

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; brandId?: string; categoryId?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = { isSold: false };

  if (params.brandId) where.brandId = params.brandId;
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) (where.price as Record<string, unknown>).gte = parseFloat(params.minPrice);
    if (params.maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(params.maxPrice);
  }
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [cars, brands, categories] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carros</h1>

      <SearchFilters brands={brands} categories={categories} />

      {cars.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-lg">Nenhum carro encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
