import { CarForm } from "@/components/admin/CarForm";
import { requireInternalAccess } from "@/lib/api";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { slugifyName } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const VALID_VEHICLE_TYPES = ["CAR", "MOTORCYCLE", "ELECTRIC_BIKE"] as const;
const VALID_CONDITIONS = ["NEW", "USED"] as const;

export default async function AdminCarsNewPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function createCar(formData: FormData) {
    "use server";

    const auth = await requireInternalAccess();
    if ("error" in auth) return "Sessao expirada ou sem permissao para cadastrar veiculo.";

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = String(formData.get("price") || "");
    const purchasePrice = String(formData.get("purchasePrice") || "");
    const fipePrice = String(formData.get("fipePrice") || "");
    const year = String(formData.get("year") || "");
    const mileage = String(formData.get("mileage") || "");
    const vehicleType = String(formData.get("vehicleType") || "");
    const condition = String(formData.get("condition") || "");
    const fuelType = String(formData.get("fuelType") || "").trim();
    const transmission = String(formData.get("transmission") || "").trim();
    const color = String(formData.get("color") || "").trim();
    const doors = String(formData.get("doors") || "");
    const capacity = String(formData.get("capacity") || "");
    const location = String(formData.get("location") || "").trim();
    const brandId = String(formData.get("brandId") || "");
    const categoryId = String(formData.get("categoryId") || "");
    const imageUrls = String(formData.get("imageUrls") || "");
    const features = formData
      .getAll("features")
      .map((value) => String(value).trim())
      .filter(Boolean);
    const isFeatured = formData.get("isFeatured") === "on";
    const isPromotion = formData.get("isPromotion") === "on";
    const promotionNote = String(formData.get("promotionNote") || "").trim();

    if (!title || !description || !price || !year || !brandId || !categoryId || !vehicleType || !condition) {
      return "Revise os campos obrigatorios: titulo, descricao, preco, ano, tipo, status, marca e categoria.";
    }

    if (!VALID_VEHICLE_TYPES.includes(vehicleType as (typeof VALID_VEHICLE_TYPES)[number])) {
      return "Selecione um tipo de veiculo valido.";
    }

    if (!VALID_CONDITIONS.includes(condition as (typeof VALID_CONDITIONS)[number])) {
      return "Selecione o status operacional do veiculo.";
    }

    const priceNum = parseDecimal(price);
    if (!priceNum || priceNum <= 0) {
      return "Informe um preco de venda maior que zero.";
    }

    const fipePriceNum = fipePrice ? parseDecimal(fipePrice) : null;
    if (fipePriceNum !== null && (!fipePriceNum || fipePriceNum <= 0)) {
      return "Informe uma referencia FIPE/manual maior que zero ou deixe o campo vazio.";
    }

    const purchasePriceNum = purchasePrice ? parseDecimal(purchasePrice) : null;
    if (purchasePriceNum !== null && (!purchasePriceNum || purchasePriceNum <= 0)) {
      return "Informe um custo de entrada maior que zero ou deixe o campo vazio.";
    }

    const yearNum = parseInt(year, 10);
    if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      return "Informe um ano valido para o veiculo.";
    }

    const mileageNum = mileage ? parseOptionalInteger(mileage, "quilometragem") : null;
    if (typeof mileageNum === "string") return mileageNum;

    const doorsNum = doors ? parseOptionalInteger(doors, "numero de portas") : null;
    if (typeof doorsNum === "string") return doorsNum;

    const capacityNum = capacity ? parseOptionalInteger(capacity, "capacidade") : null;
    if (typeof capacityNum === "string") return capacityNum;

    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { id: true } });
    const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
    if (!brand || !category) {
      return "Selecione uma marca e uma categoria cadastradas antes de salvar.";
    }

    const slugBase = slugifyName(title).substring(0, 80);
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const images = imageUrls
      ? imageUrls
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean)
          .map((url, index) => ({ url, isPrimary: index === 0 }))
      : [];

    try {
      await prisma.car.create({
        data: {
          title,
          description,
          price: priceNum,
          purchasePrice: purchasePriceNum,
          fipePrice: fipePriceNum,
          year: yearNum,
          mileage: mileageNum,
          vehicleType: vehicleType as (typeof VALID_VEHICLE_TYPES)[number],
          condition: condition as (typeof VALID_CONDITIONS)[number],
          fuelType,
          transmission,
          color,
          doors: doorsNum,
          capacity: capacityNum,
          location,
          features,
          slug,
          brandId,
          categoryId,
          isFeatured,
          isPromotion,
          promotionNote: promotionNote || null,
          images: images.length > 0 ? { create: images } : undefined,
        },
      });

      logger.adminAction("vehicle_created", { title, brandId, categoryId, vehicleType });
    } catch (error) {
      logger.error("Failed to create vehicle", { title, error: String(error) });
      return "Nao foi possivel criar o veiculo. Revise os dados e tente novamente.";
    }

    revalidatePath("/admin/cars");
    revalidatePath("/admin/cars-new");
    revalidatePath("/admin");
    revalidatePath("/carros");
    redirect("/admin/cars");
  }

  return (
    <div>
      <section className="admin-hero-panel mb-6 rounded-xl p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-dark">Entrada de estoque</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Novo veiculo</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Cadastre os dados publicos do anuncio e os parametros internos de preco, margem e operacao antes de publicar na vitrine.
        </p>
      </section>
      <CarForm action={createCar} brands={brands} categories={categories} />
    </div>
  );
}

function parseDecimal(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInteger(value: string, label: string): number | string {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return `Informe ${label} com numero valido ou deixe em branco.`;
  }
  return parsed;
}
