import { describe, expect, it } from "vitest";

import {
  createSessionPayload,
  getExpiredSessionCookieOptions,
  getSessionCookieOptions,
  validateLoginInput,
  validateRegisterInput,
} from "./auth";

describe("auth input validation", () => {
  it("normalizes register email and trims name", () => {
    const result = validateRegisterInput({
      name: "  Maria Silva  ",
      email: "  MARIA@EXAMPLE.COM  ",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data).toEqual({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "password123",
    });
  });

  it("rejects weak register passwords", () => {
    const result = validateRegisterInput({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "123",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("A senha deve ter pelo menos 8 caracteres.");
  });

  it("rejects register passwords that exceed bcrypt byte limit", () => {
    const result = validateRegisterInput({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "a".repeat(73),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("A senha deve ter no máximo 72 bytes.");
  });

  it("normalizes login email", () => {
    const result = validateLoginInput({
      email: "  USER@EXAMPLE.COM  ",
      password: "password123",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.email).toBe("user@example.com");
  });

  it("rejects login passwords that exceed bcrypt byte limit", () => {
    const result = validateLoginInput({
      email: "user@example.com",
      password: "a".repeat(73),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe("Email ou senha inválidos.");
  });
});

describe("session payload", () => {
  it("excludes password from token payload", () => {
    const payload = createSessionPayload({
      id: "user_1",
      name: "Maria Silva",
      email: "maria@example.com",
      role: "USER",
      password: "hashed-password",
    });

    expect(payload).toEqual({
      sub: "user_1",
      name: "Maria Silva",
      email: "maria@example.com",
      role: "USER",
    });
    expect(payload).not.toHaveProperty("password");
  });
});

describe("session cookie options", () => {
  it("keeps localhost cookies usable over HTTP", () => {
    const options = getSessionCookieOptions(new Request("http://localhost:3000/api/auth/login"));

    expect(options).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      priority: "high",
    });
    expect(options.maxAge).toBeGreaterThan(0);
  });

  it("uses secure cookies for HTTPS requests behind a proxy", () => {
    const options = getSessionCookieOptions(
      new Request("http://app.local/api/auth/login", {
        headers: {
          host: "admin.limaautomoveis.com.br",
          "x-forwarded-proto": "https",
        },
      }),
    );

    expect(options.secure).toBe(true);
  });

  it("expires the session cookie with the same base policy", () => {
    const options = getExpiredSessionCookieOptions(new Request("http://localhost:3000/api/auth/logout"));

    expect(options.secure).toBe(false);
    expect(options.maxAge).toBe(0);
    expect(options.expires?.getTime()).toBe(0);
  });
});
