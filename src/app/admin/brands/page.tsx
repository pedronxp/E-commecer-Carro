export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cars: true } } },
  });

  async function createBrand(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name || !name.trim()) return;

    try {
      const slug = name.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      await prisma.brand.create({ data: { name: name.trim(), slug } });
      logger.adminAction("brand_created", { name });
      revalidatePath("/admin/brands");
    } catch (error) {
      logger.error("Failed to create brand", { name, error: String(error) });
      throw error;
    }
  }

  async function deleteBrand(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;

    try {
      const brand = await prisma.brand.findUnique({ where: { id } });
      await prisma.car.deleteMany({ where: { brandId: id } });
      await prisma.brand.delete({ where: { id } });
      logger.adminAction("brand_deleted", { brandId: id, brandName: brand?.name });
      revalidatePath("/admin/brands");
    } catch (error) {
      logger.error("Failed to delete brand", { brandId: id, error: String(error) });
      throw error;
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
        <p className="text-gray-500 mt-1">{brands.length} marcas cadastradas</p>
      </div>

      <form action={createBrand} className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <input
            name="name"
            placeholder="Nome da nova marca..."
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {brands.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <p className="text-lg font-medium text-gray-600">Nenhuma marca cadastrada.</p>
            <p className="text-sm mt-1">Adicione a primeira marca acima.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-medium text-sm">{brand.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{brand.name}</span>
                    <p className="text-xs text-gray-500">{brand._count.cars} {brand._count.cars === 1 ? "carro" : "carros"}</p>
                  </div>
                </div>
                <form action={deleteBrand}>
                  <input type="hidden" name="id" value={brand.id} />
                  <ConfirmSubmitButton
                    type="submit"
                    message={`Excluir a marca "${brand.name}"?`}
                    className="px-3 py-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Excluir
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
