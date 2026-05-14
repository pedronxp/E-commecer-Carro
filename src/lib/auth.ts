import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const MIN_PASSWORD_LENGTH = 8;
const MAX_BCRYPT_PASSWORD_BYTES = 72;

export type UserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
};

export type SessionPayload = {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
};

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export function validateRegisterInput(input: unknown): ValidationResult<RegisterInput> {
  if (!isObject(input)) {
    return { ok: false, error: "Dados inválidos." };
  }

  const name = normalizeText(input.name);
  const email = normalizeEmail(input.email);
  const password = typeof input.password === "string" ? input.password : "";

  if (!name) {
    return { ok: false, error: "Nome é obrigatório." };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: "Email inválido." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: "A senha deve ter pelo menos 8 caracteres.",
    };
  }

  if (getUtf8ByteLength(password) > MAX_BCRYPT_PASSWORD_BYTES) {
    return {
      ok: false,
      error: "A senha deve ter no máximo 72 bytes.",
    };
  }

  return { ok: true, data: { name, email, password } };
}

export function validateLoginInput(input: unknown): ValidationResult<LoginInput> {
  if (!isObject(input)) {
    return { ok: false, error: "Dados inválidos." };
  }

  const email = normalizeEmail(input.email);
  const password = typeof input.password === "string" ? input.password : "";

  if (
    !isValidEmail(email) ||
    !password ||
    getUtf8ByteLength(password) > MAX_BCRYPT_PASSWORD_BYTES
  ) {
    return { ok: false, error: "Email ou senha inválidos." };
  }

  return { ok: true, data: { email, password } };
}

export function createSessionPayload(user: AuthUser): SessionPayload {
  return {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function signSessionToken(user: AuthUser): Promise<string> {
  const payload = createSessionPayload(user);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !isUserRole(payload.role)
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getUtf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "USER" || value === "ADMIN";
}
