import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const json = await request.json();
  const category = await prisma.category.create({
    data: { name: json.name, slug: json.name.toLowerCase().replace(/\s+/g, "-") },
  });
  return NextResponse.json(category, { status: 201 });
}
