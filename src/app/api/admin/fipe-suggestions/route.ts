import { NextResponse } from "next/server";
import { requireInternalAccess } from "@/lib/api";
import { findFipexModelSuggestions } from "@/lib/fipe-provider";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;

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
