import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { registerSchema } from "@/lib/schemas";
import { handleApiError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { name, email, password } = registerSchema.parse(json);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return NextResponse.json(
      { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "auth.register.POST");
  }
}
