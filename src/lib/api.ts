import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyToken } from "@/lib/auth";

export type AuthUser = { id: string; email: string; role: string };

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };
  if (user.role !== "ADMIN") return { error: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) };
  return { user };
}

export function handleApiError(error: unknown, context: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Dados inválidos", details: error.flatten() },
      { status: 400 }
    );
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") return NextResponse.json({ error: "Registro duplicado" }, { status: 409 });
    if (code === "P2025") return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });
  }

  console.error(`[API_ERROR] ${context}`, error);
  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
}
