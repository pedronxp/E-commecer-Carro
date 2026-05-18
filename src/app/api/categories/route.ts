import { apiCreated, apiData, conflictError, handleApiError, requireInternalAccess } from "@/lib/api";
import { categorySchema, slugifyName } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return apiData(categories);
  } catch (error) {
    return handleApiError(error, "categories.GET");
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
    const data = categorySchema.parse(raw);
    const slug = slugifyName(data.name);

    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return conflictError("Categoria ja cadastrada.");
    }

    const category = await prisma.category.create({
      data: { name: data.name, slug },
      select: { id: true, name: true, slug: true },
    });
    return apiCreated(category);
  } catch (error) {
    return handleApiError(error, "categories.POST");
  }
}
