import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await prisma.car.findUnique({
    where: { id },
    include: { brand: true, category: true, images: { orderBy: { isPrimary: "desc" } } },
  });
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(car);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await request.json();
  const car = await prisma.car.update({
    where: { id },
    data: {
      title: json.title,
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
      isSold: json.isSold ?? undefined,
      isFeatured: json.isFeatured ?? undefined,
      brandId: json.brandId,
      categoryId: json.categoryId,
    },
    include: { brand: true, category: true, images: true },
  });
  return NextResponse.json(car);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.carImage.deleteMany({ where: { carId: id } });
  await prisma.car.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
