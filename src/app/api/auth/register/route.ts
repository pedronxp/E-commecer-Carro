import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  const json = await request.json();
  const { name, email, password } = json;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
}
