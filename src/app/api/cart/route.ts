import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try { return verifyToken(token); } catch { return null; }
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { car: { include: { brand: true, images: { where: { isPrimary: true }, take: 1 } } } },
    orderBy: { addedAt: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { carId } = await request.json();
  const existing = await prisma.cartItem.findUnique({ where: { userId_carId: { userId: user.id, carId } } });
  if (existing) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ inCart: false });
  }
  await prisma.cartItem.create({ data: { userId: user.id, carId } });
  return NextResponse.json({ inCart: true });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { carId } = await request.json();
  await prisma.cartItem.deleteMany({ where: { userId: user.id, carId } });
  return NextResponse.json({ message: "Removed" });
}
