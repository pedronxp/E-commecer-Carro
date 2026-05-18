import { apiData, apiDeleted, conflictError, handleApiError, notFoundError, requireInternalAccess } from "@/lib/api";
import { categorySchema, slugifyName } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return notFoundError();
    return apiData(category);
  } catch (error) {
    return handleApiError(error, "categories.[id].GET");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const data = categorySchema.parse(await request.json());
    const slug = slugifyName(data.name);
    const existingCategory = await prisma.category.findUnique({ where: { slug } });

    if (existingCategory && existingCategory.id !== id) {
      return conflictError("Categoria ja cadastrada.");
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: data.name, slug },
    });
    return apiData(category);
  } catch (error) {
    return handleApiError(error, "categories.[id].PUT");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { cars: true } } },
    });

    if (!category) return notFoundError();
    if (category._count.cars > 0) {
      return conflictError("Esta categoria possui veiculos vinculados.");
    }

    await prisma.category.delete({ where: { id } });
    return apiDeleted();
  } catch (error) {
    return handleApiError(error, "categories.[id].DELETE");
  }
}
