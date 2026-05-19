export const dynamic = "force-dynamic";

import { ConfirmSubmitButton } from "@/components/admin/AdminFormControls";
import { requireInternalAccess } from "@/lib/api";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { brandSchema, categorySchema, slugifyName } from "@/lib/schemas";
import { Factory, Layers3, Plus, Wand2, type LucideIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

type TaxonomyType = "brands" | "categories";

type TaxonomyConfig = {
  type: TaxonomyType;
  title: string;
  eyebrow: string;
  description: string;
  createTitle: string;
  inputPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  createLabel: string;
  icon: LucideIcon;
  suggestions?: string[];
};

const suggestedCategories = ["Sedan", "Hatch", "SUV", "Picape", "Moto", "Bike eletrica"];

const configs: Record<TaxonomyType, TaxonomyConfig> = {
  brands: {
    type: "brands",
    title: "Marcas / Fabricantes",
    eyebrow: "Catalogo",
    description: "Fabricantes usados no estoque, filtros e cards da vitrine.",
    createTitle: "Cadastrar fabricante",
    inputPlaceholder: "Ex: Toyota, Honda, Yamaha",
    emptyTitle: "Nenhuma marca cadastrada.",
    emptyDescription: "Cadastre a primeira marca antes de registrar veiculos.",
    createLabel: "Adicionar marca",
    icon: Factory,
  },
  categories: {
    type: "categories",
    title: "Categorias / Segmentos",
    eyebrow: "Organizacao",
    description: "Segmentos comerciais usados para organizar vitrine, filtros e operacao.",
    createTitle: "Cadastrar segmento",
    inputPlaceholder: "Ex: Sedan, SUV, Moto",
    emptyTitle: "Nenhuma categoria cadastrada.",
    emptyDescription: "Cadastre a primeira categoria para organizar a vitrine.",
    createLabel: "Adicionar categoria",
    icon: Layers3,
    suggestions: suggestedCategories,
  },
};

export default async function AdminTaxonomyPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!isTaxonomyType(type)) notFound();

  const config = configs[type];
  const items = await getItems(config.type);
  const totalLinkedVehicles = items.reduce((sum, item) => sum + item._count.cars, 0);
  const unusedItems = items.filter((item) => item._count.cars === 0).length;
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <section className="admin-hero-panel rounded-xl p-6 shadow-sm">
        <div className="relative z-[1] flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary-light p-3 text-primary-dark">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-dark">{config.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">{config.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{config.description}</p>
            </div>
          </div>
          <div className="grid gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-slate-700 sm:grid-cols-3 lg:min-w-96">
            <TaxonomyMetric label="Itens" value={items.length} />
            <TaxonomyMetric label="Em uso" value={items.length - unusedItems} />
            <TaxonomyMetric label="Veiculos" value={totalLinkedVehicles} />
          </div>
        </div>
      </section>

      <section className="admin-command-bar rounded-xl p-4">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">{config.createTitle}</h2>
            <p className="text-sm text-slate-500">O sistema reutiliza um item existente quando o nome normalizado ja esta cadastrado.</p>
          </div>
          {config.suggestions ? (
            <form action={createCategorySuggestions}>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/20 px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light">
                <Wand2 className="h-4 w-4" />
                Criar sugestoes
              </button>
            </form>
          ) : null}
        </div>
        <form action={createTaxonomyItem} className="flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="type" value={config.type} />
          <input
            name="name"
            placeholder={config.inputPlaceholder}
            required
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            {config.createLabel}
          </button>
        </form>
      </section>

      <section className="admin-panel overflow-hidden rounded-xl bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500">
            <Icon className="mx-auto mb-4 h-14 w-14 text-slate-300" />
            <p className="text-lg font-medium text-slate-700">{config.emptyTitle}</p>
            <p className="mt-1 text-sm">{config.emptyDescription}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-light text-sm font-bold text-primary-dark">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate font-semibold text-slate-950">{item.name}</span>
                    <p className="text-xs text-slate-500">{item._count.cars} veiculo(s) vinculados</p>
                  </div>
                </div>

                {item._count.cars > 0 ? (
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    Em uso
                  </span>
                ) : (
                  <form action={deleteTaxonomyItem}>
                    <input type="hidden" name="type" value={config.type} />
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmSubmitButton
                      type="submit"
                      message={`Excluir "${item.name}"?`}
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

function isTaxonomyType(type: string): type is TaxonomyType {
  return type === "brands" || type === "categories";
}

async function createTaxonomyItem(formData: FormData) {
  "use server";

  const auth = await requireInternalAccess();
  if ("error" in auth) return;

  const type = String(formData.get("type") || "");
  if (!isTaxonomyType(type)) return;

  const rawName = String(formData.get("name") || "").trim();
  const parsed = type === "brands"
    ? brandSchema.safeParse({ name: rawName })
    : categorySchema.safeParse({ name: rawName });
  if (!parsed.success) return;

  const slug = slugifyName(parsed.data.name);
  try {
    if (type === "brands") {
      await prisma.brand.upsert({
        where: { slug },
        update: {},
        create: { name: parsed.data.name, slug },
      });
      logger.adminAction("brand_upserted", { name: parsed.data.name });
    } else {
      await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name: parsed.data.name, slug },
      });
      logger.adminAction("category_upserted", { name: parsed.data.name });
    }

    revalidateTaxonomyPaths(type);
  } catch (error) {
    logger.error("Failed to create taxonomy item", { type, name: rawName, error: String(error) });
    throw error;
  }
}

async function deleteTaxonomyItem(formData: FormData) {
  "use server";

  const auth = await requireInternalAccess();
  if ("error" in auth) return;

  const type = String(formData.get("type") || "");
  const id = String(formData.get("id") || "");
  if (!isTaxonomyType(type) || !id) return;

  try {
    if (type === "brands") {
      const brand = await prisma.brand.findUnique({
        where: { id },
        include: { _count: { select: { cars: true } } },
      });
      if (!brand || brand._count.cars > 0) return;
      await prisma.brand.delete({ where: { id } });
      logger.adminAction("brand_deleted", { brandId: id, brandName: brand.name });
    } else {
      const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { cars: true } } },
      });
      if (!category || category._count.cars > 0) return;
      await prisma.category.delete({ where: { id } });
      logger.adminAction("category_deleted", { categoryId: id, categoryName: category.name });
    }

    revalidateTaxonomyPaths(type);
  } catch (error) {
    logger.error("Failed to delete taxonomy item", { type, id, error: String(error) });
    throw error;
  }
}

async function createCategorySuggestions() {
  "use server";

  const auth = await requireInternalAccess();
  if ("error" in auth) return;

  for (const name of suggestedCategories) {
    const slug = slugifyName(name);
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  logger.adminAction("suggested_categories_seeded", { count: suggestedCategories.length });
  revalidateTaxonomyPaths("categories");
}

async function getItems(type: TaxonomyType) {
  if (type === "brands") {
    return prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { cars: true } } },
    });
  }

  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cars: true } } },
  });
}

function revalidateTaxonomyPaths(type: TaxonomyType) {
  revalidatePath(`/admin/taxonomies/${type}`);
  revalidatePath(type === "brands" ? "/admin/brands" : "/admin/categories");
  revalidatePath("/admin/cars-new");
  revalidatePath("/admin");
}

function TaxonomyMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}
