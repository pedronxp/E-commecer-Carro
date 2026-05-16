import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Cadastro público desativado." },
    { status: 403 },
  );
}
