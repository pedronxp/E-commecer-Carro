import Link from "next/link";

type CarCardProps = {
  car: {
    id: string;
    title: string;
    slug: string;
    price: number;
    year: number;
    mileage: number | null;
    fuelType: string | null;
    brand: { name: string };
    images: { url: string }[];
  };
};

export default function CarCard({ car }: CarCardProps) {
  const imageUrl = car.images[0]?.url || "/placeholder-car.svg";

  return (
    <Link href={`/cars/${car.slug}`} className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[16/10] bg-zinc-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{car.brand.name}</p>
        <h3 className="font-semibold text-zinc-900 mb-2 line-clamp-1">{car.title}</h3>
        <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
          <span>{car.year}</span>
          {car.mileage && <span>{car.mileage.toLocaleString()} km</span>}
          {car.fuelType && <span>{car.fuelType}</span>}
        </div>
        <p className="text-xl font-bold text-zinc-900">
          R$ {car.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </Link>
  );
}
