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
    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { car: { include: { brand: true, images: { where: { isPrimary: true }, take: 1 } } } },
      orderBy: { addedAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return handleApiError(error, "cart.GET");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { carId } = carToggleSchema.parse(await request.json());
    const existing = await prisma.cartItem.findUnique({ where: { userId_carId: { userId: user.id, carId } } });
    if (existing) {
      await prisma.cartItem.delete({ where: { id: existing.id } });
      return NextResponse.json({ inCart: false });
    }
    await prisma.cartItem.create({ data: { userId: user.id, carId } });
    return NextResponse.json({ inCart: true });
  } catch (error) {
    return handleApiError(error, "cart.POST");
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { carId } = carToggleSchema.parse(await request.json());
    await prisma.cartItem.deleteMany({ where: { userId: user.id, carId } });
    return NextResponse.json({ message: "Removed" });
  } catch (error) {
    return handleApiError(error, "cart.DELETE");
  }
}
