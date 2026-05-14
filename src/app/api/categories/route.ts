import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError } from "@/lib/api";
import { categorySchema } from "@/lib/schemas";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error, "categories.GET");
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const contentType = request.headers.get("content-type") || "";
    const raw = contentType.includes("application/json")
      ? await request.json()
      : { name: (await request.formData()).get("name") };
    const data = categorySchema.parse(raw);

    const category = await prisma.category.create({
      data: { name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, "-") },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error, "categories.POST");
  }
}
