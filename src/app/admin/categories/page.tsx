export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cars: true } } },
  });

  async function createCategory(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (!name || !name.trim()) return;

    try {
      const slug = name.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      await prisma.category.create({ data: { name: name.trim(), slug } });
      logger.adminAction("category_created", { name });
      revalidatePath("/admin/categories");
    } catch (error) {
      logger.error("Failed to create category", { name, error: String(error) });
      throw error;
    }
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;

    try {
      const cat = await prisma.category.findUnique({ where: { id } });
      await prisma.car.deleteMany({ where: { categoryId: id } });
      await prisma.category.delete({ where: { id } });
      logger.adminAction("category_deleted", { categoryId: id, categoryName: cat?.name });
      revalidatePath("/admin/categories");
    } catch (error) {
      logger.error("Failed to delete category", { categoryId: id, error: String(error) });
      throw error;
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <p className="text-gray-500 mt-1">{categories.length} categorias cadastradas</p>
      </div>

      <form action={createCategory} className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <input
            name="name"
            placeholder="Nome da nova categoria..."
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
        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <p className="text-lg font-medium text-gray-600">Nenhuma categoria cadastrada.</p>
            <p className="text-sm mt-1">Adicione a primeira categoria acima.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-medium text-sm">{cat.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    <p className="text-xs text-gray-500">{cat._count.cars} {cat._count.cars === 1 ? "carro" : "carros"}</p>
                  </div>
                </div>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={cat.id} />
                  <ConfirmSubmitButton
                    type="submit"
                    message={`Excluir a categoria "${cat.name}"?`}
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
