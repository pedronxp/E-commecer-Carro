import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(brands);
}

export async function POST(request: Request) {
  const json = await request.json();
  const brand = await prisma.brand.create({
    data: { name: json.name, slug: json.name.toLowerCase().replace(/\s+/g, "-") },
  });
  return NextResponse.json(brand, { status: 201 });
}
