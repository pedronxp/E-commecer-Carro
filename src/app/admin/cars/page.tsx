export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { Eye, Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

const vehicleTypeLabels = {
  CAR: "Carro",
  MOTORCYCLE: "Moto",
  ELECTRIC_BIKE: "Bike elétrica",
} as const;

const conditionLabels = {
  NEW: "Novo",
  USED: "Segunda mão",
} as const;

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "all";
  const brandFilter = params.brand || "all";

  logger.dbOperation("vehicle_list_access", { query, status, brandFilter });

  const where = {
    ...(query && {
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(status === "sold" && { isSold: true }),
    ...(status === "stock" && { isSold: false }),
    ...(status === "featured" && { isFeatured: true }),
    ...(status === "promotion" && { isPromotion: true }),
    ...(brandFilter !== "all" && { brandId: brandFilter }),
  };

  const [cars, brands] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  async function deleteCar(formData: FormData) {
    "use server";
    const carId = formData.get("carId") as string;

    try {
      const car = await prisma.car.findUnique({ where: { id: carId } });
      await prisma.carImage.deleteMany({ where: { carId } });
      await prisma.favorite.deleteMany({ where: { carId } });
      await prisma.cartItem.deleteMany({ where: { carId } });
      await prisma.car.delete({ where: { id: carId } });
      logger.adminAction("vehicle_deleted", { carId, carTitle: car?.title });
      revalidatePath("/admin/cars");
      revalidatePath("/admin");
    } catch (error) {
      logger.error("Failed to delete vehicle", { carId, error: String(error) });
      throw error;
    }
  }

  async function toggleFeatured(formData: FormData) {
    "use server";
    const carId = formData.get("carId") as string;

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return;

    await prisma.car.update({ where: { id: carId }, data: { isFeatured: !car.isFeatured } });
    revalidatePath("/admin/cars");
    revalidatePath("/admin");
  }

  async function toggleSold(formData: FormData) {
    "use server";
    const carId = formData.get("carId") as string;

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) return;

    await prisma.car.update({ where: { id: carId }, data: { isSold: !car.isSold } });
    revalidatePath("/admin/cars");
    revalidatePath("/admin");
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700">Catálogo operacional</p>
          <h1 className="text-2xl font-bold text-slate-950">Estoque</h1>
          <p className="mt-1 text-slate-500">{cars.length} veículos encontrados</p>
        </div>
        <Link
          href="/admin/cars-new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
          Novo veículo
        </Link>
      </div>

      <form className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-4">
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por título ou descrição..."
            className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">Todos os status</option>
            <option value="stock">Em estoque</option>
            <option value="sold">Vendidos</option>
            <option value="featured">Destaques</option>
            <option value="promotion">Promoções</option>
          </select>
          <select
            name="brand"
            defaultValue={brandFilter}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">Todas as marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
            Filtrar
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-medium text-slate-500">Imagem</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-slate-500">Veículo</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-slate-500">Tipo</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-slate-500">Ano</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-slate-500">Preço/FIPE</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-slate-500">Margem</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-slate-500">Status</th>
                <th className="px-5 py-4 text-left text-sm font-medium text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cars.map((car) => {
                const discount =
                  car.fipePrice && car.fipePrice > car.price
                    ? Math.round(((car.fipePrice - car.price) / car.fipePrice) * 100)
                    : 0;
                const grossMargin = car.purchasePrice ? car.price - car.purchasePrice : null;

                return (
                  <tr key={car.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-slate-100">
                        {car.images[0]?.url ? (
                          <Image src={car.images[0].url} alt="" fill sizes="64px" className="object-cover" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[260px] truncate font-semibold text-slate-950">{car.title}</p>
                      <p className="text-xs text-slate-500">{car.brand.name} · {car.category?.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {vehicleTypeLabels[car.vehicleType]}
                      </span>
                      <p className="mt-1 text-xs text-slate-500">{conditionLabels[car.condition]}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{car.year}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">
                        {car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </p>
                      {discount > 0 ? (
                        <p className="mt-1 text-xs font-semibold text-emerald-700">{discount}% abaixo da FIPE</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      {grossMargin !== null ? (
                        <>
                          <p className={grossMargin >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>
                            {grossMargin.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Custo {car.purchasePrice?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400">Sem custo</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <form action={toggleSold}>
                          <input type="hidden" name="carId" value={car.id} />
                          <button
                            type="submit"
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${car.isSold ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-emerald-700"}`}
                          >
                            {car.isSold ? "Vendido" : "Estoque"}
                          </button>
                        </form>
                        {car.isFeatured ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Destaque</span> : null}
                        {car.isPromotion ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Promoção</span> : null}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <form action={toggleFeatured}>
                          <input type="hidden" name="carId" value={car.id} />
                          <button
                            type="submit"
                            className={`rounded-lg p-2 transition ${car.isFeatured ? "text-amber-600 hover:bg-amber-50" : "text-slate-400 hover:bg-slate-100"}`}
                            title={car.isFeatured ? "Remover destaque" : "Destacar"}
                          >
                            <Star className="h-5 w-5" />
                          </button>
                        </form>
                        <Link
                          href={`/carros/${car.slug}`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Ver vitrine"
                          target="_blank"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        {car.isPromotion ? <Sparkles className="h-5 w-5 text-emerald-600" aria-label="Promoção" /> : null}
                        <form action={deleteCar}>
                          <input type="hidden" name="carId" value={car.id} />
                          <ConfirmSubmitButton
                            type="submit"
                            message="Excluir este veículo?"
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            title="Excluir"
                          >
                            <Trash2 className="h-5 w-5" />
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {cars.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <p className="text-lg font-medium text-slate-700">Nenhum veículo encontrado.</p>
            <p className="mt-1 text-sm">Tente ajustar os filtros ou cadastre um novo veículo.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
