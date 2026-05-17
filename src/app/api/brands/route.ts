import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAccess, handleApiError } from "@/lib/api";
import { brandSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(brands);
  } catch (error) {
    return handleApiError(error, "brands.GET");
  }
}

export async function POST(request: Request) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;

  try {
    const contentType = request.headers.get("content-type") || "";
    const raw = contentType.includes("application/json")
      ? await request.json()
      : { name: (await request.formData()).get("name") };
    const data = brandSchema.parse(raw);
    const slug = data.name.toLowerCase().replace(/\s+/g, "-");

    const existingBrand = await prisma.brand.findUnique({ where: { slug } });
    if (existingBrand) {
      return NextResponse.json({ error: "Marca já cadastrada." }, { status: 409 });
    }

    const brand = await prisma.brand.create({
      data: { name: data.name, slug },
    });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    return handleApiError(error, "brands.POST");
  }
}
