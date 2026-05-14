import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CarActions from "@/components/CarActions";

export default async function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const car = await prisma.car.findUnique({
    where: { slug },
    include: { brand: true, category: true, images: { orderBy: { isPrimary: "desc" } } },
  });

  if (!car) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-[16/10] bg-zinc-100 rounded-xl overflow-hidden">
            <img src={car.images[0]?.url || "/placeholder-car.svg"} alt={car.title} className="w-full h-full object-cover" />
          </div>
          {car.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {car.images.slice(1).map((img) => (
                <div key={img.id} className="aspect-[16/10] bg-zinc-100 rounded-lg overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-zinc-500 uppercase tracking-wide mb-1">{car.brand.name} / {car.category.name}</p>
          <h1 className="text-3xl font-bold mb-4">{car.title}</h1>
          <p className="text-3xl font-bold text-zinc-900 mb-6">
            R$ {car.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>

          <CarActions carId={car.id} />

          <div className="grid grid-cols-2 gap-4 mb-6">
            <InfoItem label="Ano" value={car.year} />
            <InfoItem label="Quilometragem" value={car.mileage ? `${car.mileage.toLocaleString()} km` : "N/A"} />
            <InfoItem label="Combustível" value={car.fuelType || "N/A"} />
            <InfoItem label="Câmbio" value={car.transmission || "N/A"} />
            <InfoItem label="Cor" value={car.color || "N/A"} />
            <InfoItem label="Portas" value={car.doors?.toString() || "N/A"} />
            <InfoItem label="Lugares" value={car.capacity?.toString() || "N/A"} />
            <InfoItem label="Localização" value={car.location || "N/A"} />
          </div>

          <div className="border-t border-zinc-200 pt-6">
            <h2 className="font-semibold mb-2">Descrição</h2>
            <p className="text-zinc-600 leading-relaxed">{car.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-50 rounded-lg p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
