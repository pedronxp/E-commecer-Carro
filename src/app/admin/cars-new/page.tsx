import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";
import { CarForm } from "@/components/admin/CarForm";

export default async function AdminCarsNewPage() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function createCar(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const year = formData.get("year") as string;
    const mileage = formData.get("mileage") as string;
    const fuelType = formData.get("fuelType") as string;
    const transmission = formData.get("transmission") as string;
    const color = formData.get("color") as string;
    const doors = formData.get("doors") as string;
    const capacity = formData.get("capacity") as string;
    const location = formData.get("location") as string;
    const brandId = formData.get("brandId") as string;
    const categoryId = formData.get("categoryId") as string;
    const imageUrls = formData.get("imageUrls") as string;
    const isFeatured = formData.get("isFeatured") === "on";

    if (!title || !description || !price || !year || !brandId || !categoryId) {
      return "Preencha todos os campos obrigatórios.";
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return "Preço inválido.";
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      return "Ano inválido.";
    }

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80);

    const images = imageUrls
      ? imageUrls.split("\n").map((s) => s.trim()).filter(Boolean).map((url, index) => ({ url, isPrimary: index === 0 }))
      : [];

    try {
      await prisma.car.create({
        data: {
          title,
          description,
          price: priceNum,
          year: yearNum,
          mileage: mileage ? parseInt(mileage, 10) : null,
          fuelType,
          transmission,
          color,
          doors: doors ? parseInt(doors, 10) : null,
          capacity: capacity ? parseInt(capacity, 10) : null,
          location,
          slug,
          brandId,
          categoryId,
          isFeatured,
          images: images.length > 0 ? { create: images } : undefined,
        },
      });

      logger.adminAction("car_created", { title, brandId, categoryId });
      revalidatePath("/admin/cars");
      redirect("/admin/cars");
    } catch (error) {
      logger.error("Failed to create car", { title, error: String(error) });
      return "Erro ao criar o carro. Tente novamente.";
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Novo Carro</h1>
        <p className="text-gray-500 mt-1">Preencha as informações do veículo</p>
      </div>
      <CarForm action={createCar} brands={brands} categories={categories} />
    </div>
  );
}
