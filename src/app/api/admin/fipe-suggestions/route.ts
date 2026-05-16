import { NextResponse } from "next/server";
import { findFipexModelSuggestions } from "@/lib/fipe-provider";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = String(searchParams.get("q") || "").trim();
  const vehicleType = searchParams.get("vehicleType") || "CAR";
  const includeOlderModels = searchParams.get("includeOlderModels") === "1";

  if (vehicleType === "ELECTRIC_BIKE") {
    return NextResponse.json({ suggestions: [] });
  }

  if (vehicleType !== "CAR" && vehicleType !== "MOTORCYCLE") {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await findFipexModelSuggestions({ query, vehicleType, includeOlderModels });

  return NextResponse.json({ suggestions });
}
