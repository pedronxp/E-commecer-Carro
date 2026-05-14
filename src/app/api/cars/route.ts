import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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
}

export async function POST(request: Request) {
  const json = await request.json();
  const car = await prisma.car.create({
    data: {
      title: json.title,
      slug: json.title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      description: json.description,
      price: parseFloat(json.price),
      year: parseInt(json.year),
      mileage: json.mileage ? parseInt(json.mileage) : null,
      fuelType: json.fuelType || null,
      transmission: json.transmission || null,
      color: json.color || null,
      doors: json.doors ? parseInt(json.doors) : null,
      capacity: json.capacity ? parseInt(json.capacity) : null,
      location: json.location || null,
      brandId: json.brandId,
      categoryId: json.categoryId,
      images: json.images ? {
        create: json.images.map((url: string, i: number) => ({
          url, isPrimary: i === 0,
        })),
      } : undefined,
    },
    include: { brand: true, category: true, images: true },
  });
  return NextResponse.json(car, { status: 201 });
}
