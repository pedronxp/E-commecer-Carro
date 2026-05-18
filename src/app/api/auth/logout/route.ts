import { NextResponse } from "next/server";

import { getExpiredSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, "", getExpiredSessionCookieOptions(request));

  return response;
}
