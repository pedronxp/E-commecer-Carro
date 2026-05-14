import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;

function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return JWT_SECRET;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: { id: string; email: string; role: string }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as { id: string; email: string; role: string };
}
