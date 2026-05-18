import { apiCreated, apiData, conflictError, handleApiError, requireInternalAccess } from "@/lib/api";
import { brandSchema, slugifyName } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    return apiData(brands);
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
    const slug = slugifyName(data.name);

    const existingBrand = await prisma.brand.findUnique({ where: { slug } });
    if (existingBrand) {
      return conflictError("Marca ja cadastrada.");
    }

    const brand = await prisma.brand.create({
      data: { name: data.name, slug },
      select: { id: true, name: true, slug: true },
    });
    return apiCreated(brand);
  } catch (error) {
    return handleApiError(error, "brands.POST");
  }
}
