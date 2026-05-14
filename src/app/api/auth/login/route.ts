import { NextResponse } from "next/server";

import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  validateLoginInput,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const INVALID_CREDENTIALS_ERROR = "Email ou senha inválidos.";

export async function POST(request: Request) {
  const input = validateLoginInput(await readJson(request));

  if (!input.ok) {
    return NextResponse.json({ error: input.error }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: input.data.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !(await verifyPassword(input.data.password, user.password))) {
      return NextResponse.json(
        { error: INVALID_CREDENTIALS_ERROR },
        { status: 401 },
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    const token = await signSessionToken(safeUser);
    const response = NextResponse.json({ user: safeUser });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json(
      { error: "Não foi possível fazer login." },
      { status: 500 },
    );
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
