export const dynamic = "force-dynamic";

import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";
import { CategoryInfoDialog } from "@/components/admin/CategoryInfoDialog";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { Layers3, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";

const suggestedCategories = ["Sedan", "Hatch", "SUV", "Picape", "Moto", "Bike elétrica"];

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cars: true } } },
  });

  async function createCategory(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    if (!name) return;

    try {
      const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      await prisma.category.create({ data: { name, slug } });
      logger.adminAction("category_created", { name });
      revalidatePath("/admin/categories");
    } catch (error) {
      logger.error("Failed to create category", { name, error: String(error) });
      throw error;
    }
  }

  async function deleteCategory(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");

    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { cars: true } } },
      });
      if (!category || category._count.cars > 0) return;

      await prisma.category.delete({ where: { id } });
      logger.adminAction("category_deleted", { categoryId: id, categoryName: category.name });
      revalidatePath("/admin/categories");
    } catch (error) {
      logger.error("Failed to delete category", { categoryId: id, error: String(error) });
      throw error;
    }
  }

  async function createSuggestedCategories() {
    "use server";

    for (const name of suggestedCategories) {
      const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
    }

    logger.adminAction("suggested_categories_seeded", { count: suggestedCategories.length });
    revalidatePath("/admin/categories");
  }

  return (
    <div className="space-y-6">
      <CategoryInfoDialog />
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Organização</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Categorias / Segmentos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Categoria é o segmento comercial usado para organizar a vitrine, como sedan, hatch, SUV, picape, moto ou bike elétrica.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Cadastro de segmento</h2>
            <p className="text-sm text-slate-500">Crie manualmente ou use as sugestões comerciais iniciais.</p>
          </div>
          <form action={createSuggestedCategories}>
            <button className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
              Criar sugestões
            </button>
          </form>
        </div>
        <form action={createCategory} className="flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            placeholder="Nome da nova categoria..."
            required
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <Layers3 className="mx-auto mb-4 h-14 w-14 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">Nenhuma categoria cadastrada.</p>
            <p className="mt-1 text-sm">Adicione a primeira categoria para organizar a vitrine.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-950">{category.name}</span>
                    <p className="text-xs text-slate-500">{category._count.cars} veículo(s) vinculados</p>
                  </div>
                </div>

                {category._count.cars > 0 ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Em uso
                  </span>
                ) : (
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={category.id} />
                    <ConfirmSubmitButton
                      type="submit"
                      message={`Excluir a categoria "${category.name}"?`}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                    >
                      Excluir
                    </ConfirmSubmitButton>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
