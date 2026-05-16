import { CarForm } from "@/components/admin/CarForm";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const VALID_VEHICLE_TYPES = ["CAR", "MOTORCYCLE", "ELECTRIC_BIKE"] as const;
const VALID_CONDITIONS = ["NEW", "USED"] as const;

export default async function AdminCarsNewPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function createCar(formData: FormData) {
    "use server";

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
      return "Preencha todos os campos obrigatórios.";
    }

    if (!VALID_VEHICLE_TYPES.includes(vehicleType as (typeof VALID_VEHICLE_TYPES)[number])) {
      return "Tipo de veículo inválido.";
    }

    if (!VALID_CONDITIONS.includes(condition as (typeof VALID_CONDITIONS)[number])) {
      return "Status do veículo inválido.";
    }

    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      return "Preço inválido.";
    }

    const fipePriceNum = fipePrice ? parseFloat(fipePrice) : null;
    if (fipePriceNum !== null && (Number.isNaN(fipePriceNum) || fipePriceNum <= 0)) {
      return "Valor FIPE inválido.";
    }

    const purchasePriceNum = purchasePrice ? parseFloat(purchasePrice) : null;
    if (purchasePriceNum !== null && (Number.isNaN(purchasePriceNum) || purchasePriceNum <= 0)) {
      return "Custo de compra inválido.";
    }

    const yearNum = parseInt(year, 10);
    if (Number.isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      return "Ano inválido.";
    }

    const slugBase = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80);
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
          mileage: mileage ? parseInt(mileage, 10) : null,
          vehicleType: vehicleType as (typeof VALID_VEHICLE_TYPES)[number],
          condition: condition as (typeof VALID_CONDITIONS)[number],
          fuelType,
          transmission,
          color,
          doors: doors ? parseInt(doors, 10) : null,
          capacity: capacity ? parseInt(capacity, 10) : null,
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
      revalidatePath("/admin/cars");
      revalidatePath("/admin");
      redirect("/admin/cars");
    } catch (error) {
      logger.error("Failed to create vehicle", { title, error: String(error) });
      return "Erro ao criar o veículo. Tente novamente.";
    }
  }

  return (
    <div>
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Cadastro</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Novo veículo</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Cadastre carros, motos/motocicletas e bikes elétricas com status, promoção, imagens e comparativo FIPE.
        </p>
      </div>
      <CarForm action={createCar} brands={brands} categories={categories} />
    </div>
  );
}
