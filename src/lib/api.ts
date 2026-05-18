import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getExpiredSessionCookieOptions, SESSION_COOKIE_NAME, type UserRole } from "@/lib/auth";
import { getSession } from "@/lib/session";

export type AuthUser = { id: string; email: string; role: UserRole };

type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR";

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return { id: session.sub, email: session.email, role: session.role };
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) return { error: unauthorizedError("Nao autenticado") };
  if (user.role !== "ADMIN") return { error: apiError("FORBIDDEN", "Acesso negado", 403) };
  return { user };
}

export async function requireInternalAccess() {
  const user = await getAuthUser();
  if (!user) return { error: unauthorizedError("Nao autenticado") };
  if (user.role !== "ADMIN" && user.role !== "USER") {
    return { error: apiError("FORBIDDEN", "Acesso negado", 403) };
  }
  return { user };
}

export function apiData<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function apiCreated<T>(data: T) {
  return apiData(data, { status: 201 });
}

export function apiDeleted() {
  return new NextResponse(null, { status: 204 });
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
) {
  const response = NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );

  return response;
}

export function unauthorizedError(message = "Nao autenticado", request?: Request) {
  const response = apiError("UNAUTHORIZED", message, 401);
  response.cookies.set(SESSION_COOKIE_NAME, "", getExpiredSessionCookieOptions(request));

  return response;
}

export function validationError(message: string, details?: unknown) {
  return apiError("VALIDATION_ERROR", message, 400, details);
}

export function conflictError(message = "Registro duplicado") {
  return apiError("CONFLICT", message, 409);
}

export function notFoundError(message = "Registro nao encontrado") {
  return apiError("NOT_FOUND", message, 404);
}

export function handleApiError(error: unknown, context: string) {
  if (error instanceof ZodError) {
    return validationError("Dados invalidos", error.flatten());
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") return conflictError();
    if (code === "P2025") return notFoundError();
  }

  console.error(`[API_ERROR] ${context}`, error);
  return apiError("SERVER_ERROR", "Erro interno do servidor", 500);
}
