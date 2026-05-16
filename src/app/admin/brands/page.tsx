export const dynamic = "force-dynamic";

import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { Factory, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cars: true } } },
  });

  async function createBrand(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    if (!name) return;

    try {
      const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
      await prisma.brand.create({ data: { name, slug } });
      logger.adminAction("brand_created", { name });
      revalidatePath("/admin/brands");
    } catch (error) {
      logger.error("Failed to create brand", { name, error: String(error) });
      throw error;
    }
  }

  async function deleteBrand(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");

    try {
      const brand = await prisma.brand.findUnique({
        where: { id },
        include: { _count: { select: { cars: true } } },
      });
      if (!brand || brand._count.cars > 0) return;

      await prisma.brand.delete({ where: { id } });
      logger.adminAction("brand_deleted", { brandId: id, brandName: brand.name });
      revalidatePath("/admin/brands");
    } catch (error) {
      logger.error("Failed to delete brand", { brandId: id, error: String(error) });
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <Factory className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Catálogo</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Marcas / Fabricantes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Marca é o fabricante do veículo, como Toyota, Honda, Yamaha ou Oggi. Ela aparece no cadastro, filtros e cards da vitrine.
            </p>
          </div>
        </div>
      </section>

      <form action={createBrand} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            name="name"
            placeholder="Nome da nova marca..."
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
        </div>
      </form>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {brands.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <Factory className="mx-auto mb-4 h-14 w-14 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">Nenhuma marca cadastrada.</p>
            <p className="mt-1 text-sm">Adicione a primeira marca para cadastrar veículos.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {brands.map((brand) => (
              <div key={brand.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-950">{brand.name}</span>
                    <p className="text-xs text-slate-500">{brand._count.cars} veículo(s) vinculados</p>
                  </div>
                </div>

                {brand._count.cars > 0 ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Em uso
                  </span>
                ) : (
                  <form action={deleteBrand}>
                    <input type="hidden" name="id" value={brand.id} />
                    <ConfirmSubmitButton
                      type="submit"
                      message={`Excluir a marca "${brand.name}"?`}
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
