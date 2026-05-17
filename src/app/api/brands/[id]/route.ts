import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireInternalAccess, handleApiError } from "@/lib/api";
import { brandSchema } from "@/lib/schemas";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(brand);
  } catch (error) {
    return handleApiError(error, "brands.[id].GET");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await params;
    const json = await request.json();
    const data = brandSchema.parse(json);
    const brand = await prisma.brand.update({
      where: { id },
      data: { name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, "-") },
    });
    return NextResponse.json(brand);
  } catch (error) {
    return handleApiError(error, "brands.[id].PUT");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;
  try {
    const { id } = await params;
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return handleApiError(error, "brands.[id].DELETE");
  }
}
