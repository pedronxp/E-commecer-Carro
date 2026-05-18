import { apiData, apiDeleted, conflictError, handleApiError, notFoundError, requireInternalAccess } from "@/lib/api";
import { brandSchema, slugifyName } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return notFoundError();
    return apiData(brand);
  } catch (error) {
    return handleApiError(error, "brands.[id].GET");
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const data = brandSchema.parse(await request.json());
    const slug = slugifyName(data.name);
    const existingBrand = await prisma.brand.findUnique({ where: { slug } });

    if (existingBrand && existingBrand.id !== id) {
      return conflictError("Marca ja cadastrada.");
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: { name: data.name, slug },
    });
    return apiData(brand);
  } catch (error) {
    return handleApiError(error, "brands.[id].PUT");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { cars: true } } },
    });

    if (!brand) return notFoundError();
    if (brand._count.cars > 0) {
      return conflictError("Esta marca possui veiculos vinculados.");
    }

    await prisma.brand.delete({ where: { id } });
    return apiDeleted();
  } catch (error) {
    return handleApiError(error, "brands.[id].DELETE");
  }
}
