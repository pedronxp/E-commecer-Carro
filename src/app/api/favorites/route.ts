import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, handleApiError } from "@/lib/api";
import { carToggleSchema } from "@/lib/schemas";

async function getUser() {
  return getAuthUser();
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: { car: { include: { brand: true, images: { where: { isPrimary: true }, take: 1 } } } },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    return handleApiError(error, "favorites.GET");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { carId } = carToggleSchema.parse(await request.json());
    const existing = await prisma.favorite.findUnique({ where: { userId_carId: { userId: user.id, carId } } });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }
    await prisma.favorite.create({ data: { userId: user.id, carId } });
    return NextResponse.json({ favorited: true });
  } catch (error) {
    return handleApiError(error, "favorites.POST");
  }
}
