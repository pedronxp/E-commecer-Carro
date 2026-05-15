export const dynamic = "force-dynamic";
import Image from "next/image";
import Link from "next/link";
import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "all";
  const brandFilter = params.brand || "all";

  logger.dbOperation("car_list_access", { query, status, brandFilter });

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

  logger.adminAction("car_list_loaded", { count: cars.length, filters: { query, status, brandFilter } });

  async function deleteCar(formData: FormData) {
    "use server";
    const carId = formData.get("carId") as string;

    try {
      const car = await prisma.car.findUnique({ where: { id: carId } });
      await prisma.carImage.deleteMany({ where: { carId } });
      await prisma.favorite.deleteMany({ where: { carId } });
      await prisma.cartItem.deleteMany({ where: { carId } });
      await prisma.car.delete({ where: { id: carId } });
      logger.adminAction("car_deleted", { carId, carTitle: car?.title });
      revalidatePath("/admin/cars");
    } catch (error) {
      logger.error("Failed to delete car", { carId, error: String(error) });
      throw error;
    }
  }

  async function toggleFeatured(formData: FormData) {
    "use server";
    const carId = formData.get("carId") as string;

    try {
      const car = await prisma.car.findUnique({ where: { id: carId } });
      if (car) {
        const newValue = !car.isFeatured;
        await prisma.car.update({ where: { id: carId }, data: { isFeatured: newValue } });
        logger.adminAction("car_featured_toggled", { carId, carTitle: car.title, isFeatured: newValue });
        revalidatePath("/admin/cars");
      }
    } catch (error) {
      logger.error("Failed to toggle car featured", { carId, error: String(error) });
      throw error;
    }
  }

  async function toggleSold(formData: FormData) {
    "use server";
    const carId = formData.get("carId") as string;

    try {
      const car = await prisma.car.findUnique({ where: { id: carId } });
      if (car) {
        const newValue = !car.isSold;
        await prisma.car.update({ where: { id: carId }, data: { isSold: newValue } });
        logger.adminAction("car_sold_toggled", { carId, carTitle: car.title, isSold: newValue });
        revalidatePath("/admin/cars");
      }
    } catch (error) {
      logger.error("Failed to toggle car sold status", { carId, error: String(error) });
      throw error;
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carros</h1>
          <p className="text-gray-500 mt-1">{cars.length} resultados</p>
        </div>
        <Link
          href="/admin/cars-new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Carro
        </Link>
      </div>

      {/* Filters */}
      <form className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Buscar por título ou descrição..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            name="status"
            defaultValue={status}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos Status</option>
            <option value="stock">Em Estoque</option>
            <option value="sold">Vendidos</option>
            <option value="featured">Destacados</option>
          </select>
          <select
            name="brand"
            defaultValue={brandFilter}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas Marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Filtrar
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Imagem</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Título</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Marca</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Ano</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Preço</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="relative w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {car.images[0]?.url ? (
                        <Image
                          src={car.images[0].url}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">{car.title}</p>
                      <p className="text-xs text-gray-500">{car.category?.name}</p>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-600">{car.brand.name}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-600">{car.year}</td>
                  <td className="px-4 sm:px-6 py-4 font-medium text-gray-900">
                    R$ {car.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <form action={toggleSold}>
                        <input type="hidden" name="carId" value={car.id} />
                        <button
                          type="submit"
                          className={`text-xs px-2 py-1 rounded cursor-pointer ${
                            car.isSold
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {car.isSold ? "Vendido" : "Estoque"}
                        </button>
                      </form>
                      {car.isFeatured && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                          ⭐ Destaque
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-1">
                      <form action={toggleFeatured}>
                        <input type="hidden" name="carId" value={car.id} />
                        <button
                          type="submit"
                          className={`p-2 rounded-lg transition-colors ${
                            car.isFeatured
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-gray-400 hover:bg-gray-100"
                          }`}
                          title={car.isFeatured ? "Remover destaque" : "Destacar"}
                        >
                          <svg className="w-5 h-5" fill={car.isFeatured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.705c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.705a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </form>
                      <Link
                        href={`/carros/${car.slug}`}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ver"
                        target="_blank"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <form action={deleteCar}>
                        <input type="hidden" name="carId" value={car.id} />
                        <ConfirmSubmitButton
                          type="submit"
                          message="Excluir este carro?"
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cars.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium text-gray-600">Nenhum carro encontrado.</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou adicione um novo veículo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
