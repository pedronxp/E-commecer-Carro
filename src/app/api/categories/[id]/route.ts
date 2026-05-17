import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAccess, handleApiError } from "@/lib/api";
import { categorySchema } from "@/lib/schemas";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error, "categories.[id].GET");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await params;
    const json = await request.json();
    const data = categorySchema.parse(json);
    const category = await prisma.category.update({
      where: { id },
      data: { name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, "-") },
    });
    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error, "categories.[id].PUT");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return handleApiError(error, "categories.[id].DELETE");
  }
}
