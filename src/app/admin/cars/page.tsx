export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Carros ({cars.length})</h1>
        <Link href="/admin/cars-new" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          + Novo
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Imagem</th>
              <th className="text-left px-4 py-3 font-medium">Título</th>
              <th className="text-left px-4 py-3 font-medium">Marca</th>
              <th className="text-left px-4 py-3 font-medium">Ano</th>
              <th className="text-left px-4 py-3 font-medium">Preço</th>
              <th className="text-left px-4 py-3 font-medium">Destaque</th>
              <th className="text-left px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <img src={car.images[0]?.url || "/placeholder-car.svg"} alt="" className="w-16 h-12 object-cover rounded" />
                </td>
                <td className="px-4 py-3 font-medium">{car.title}</td>
                <td className="px-4 py-3 text-zinc-500">{car.brand.name}</td>
                <td className="px-4 py-3 text-zinc-500">{car.year}</td>
                <td className="px-4 py-3">R$ {car.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">{car.isFeatured ? "⭐" : "—"}</td>
                <td className="px-4 py-3">
                  <DeleteButton id={car.id} type="car" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

