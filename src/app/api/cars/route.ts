import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { carSchema } from "@/lib/schemas";
import { handleApiError, requireAdmin } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const categoryId = searchParams.get("categoryId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const isFeatured = searchParams.get("isFeatured");

    const where: Record<string, unknown> = {};
    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (isFeatured === "true") where.isFeatured = true;
    where.isSold = false;

    const cars = await prisma.car.findMany({
      where,
      include: { brand: true, category: true, images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(cars);
  } catch (error) {
    return handleApiError(error, "cars.GET");
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const json = await request.json();
    const data = carSchema.parse(json);
    const car = await prisma.car.create({
      data: {
        title: data.title,
        slug: data.title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
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
        isFeatured: data.isFeatured ?? false,
        brandId: data.brandId,
        categoryId: data.categoryId,
        images: data.images
          ? {
              create: data.images.map((url: string, i: number) => ({
                url,
                isPrimary: i === 0,
              })),
            }
          : undefined,
      },
      include: { brand: true, category: true, images: true },
    });
    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    return handleApiError(error, "cars.POST");
  }
}
