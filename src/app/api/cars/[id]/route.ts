import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { carSchema } from "@/lib/schemas";
import { handleApiError, requireAdmin } from "@/lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const car = await prisma.car.findUnique({
      where: { id },
      include: { brand: true, category: true, images: { orderBy: { isPrimary: "desc" } } },
    });
    if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(car);
  } catch (error) {
    return handleApiError(error, "cars.[id].GET");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const json = await request.json();
    const data = carSchema.parse(json);
    const car = await prisma.car.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        year: data.year,
        mileage: data.mileage ?? null,
        fuelType: data.fuelType ?? null,
        transmission: data.transmission ?? null,
        color: data.color ?? null,
        doors: data.doors ?? null,
        capacity: data.capacity ?? null,
        location: data.location ?? null,
        features: data.features ?? undefined,
        isSold: data.isSold ?? false,
        isFeatured: data.isFeatured ?? false,
        brandId: data.brandId,
        categoryId: data.categoryId,
      },
      include: { brand: true, category: true, images: true },
    });
    return NextResponse.json(car);
  } catch (error) {
    return handleApiError(error, "cars.[id].PUT");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await params;
    await prisma.carImage.deleteMany({ where: { carId: id } });
    await prisma.car.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return handleApiError(error, "cars.[id].DELETE");
  }
}
