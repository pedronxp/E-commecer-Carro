import { NextResponse } from "next/server";
import { findFipexEstimate } from "@/lib/fipe-provider";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const title = normalize(searchParams.get("title") || "");
  const year = Number(searchParams.get("year") || "");
  const vehicleType = searchParams.get("vehicleType") || "CAR";
  const tokens = title.split(" ").filter((token) => token.length >= 3).slice(0, 5);

  if (vehicleType === "ELECTRIC_BIKE") {
    return NextResponse.json({
      fipeEstimate: null,
      averageSalePrice: null,
      sampleCount: 0,
      confidence: "manual",
      source: "Bike elétrica não possui cobertura FIPE confiável neste fluxo. Informe o preço de referência manualmente.",
      externalProviderConfigured: false,
      matches: [],
    });
  }

  if (tokens.length === 0) {
    return NextResponse.json({
      fipeEstimate: null,
      averageSalePrice: null,
      sampleCount: 0,
      source: "Digite o nome do veículo para buscar referência no estoque local e na FipeX.",
      matches: [],
    });
  }

  const safeVehicleType = isVehicleType(vehicleType) ? vehicleType : "CAR";
  const [candidates, externalEstimate] = await Promise.all([
    prisma.car.findMany({
      where: {
        vehicleType: safeVehicleType,
        OR: tokens.map((token) => ({ title: { contains: token, mode: "insensitive" as const } })),
      },
      take: 12,
      orderBy: { updatedAt: "desc" },
      select: {
        title: true,
        year: true,
        price: true,
        fipePrice: true,
        purchasePrice: true,
      },
    }),
    findFipexEstimate({
      title,
      year: Number.isFinite(year) ? year : undefined,
      vehicleType: safeVehicleType,
    }),
  ]);

  const scored = candidates
    .map((vehicle) => ({
      vehicle,
      score: scoreVehicle(vehicle.title, tokens, year, vehicle.year),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const fipeValues = scored
    .map((item) => item.vehicle.fipePrice)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const saleValues = scored.map((item) => item.vehicle.price).filter((value) => value > 0);

  const localFipeEstimate = average(fipeValues);
  const fipeEstimate = externalEstimate?.price ?? localFipeEstimate;
  const averageSalePrice = average(saleValues);

  return NextResponse.json({
    fipeEstimate,
    averageSalePrice,
    sampleCount: scored.length,
    confidence: externalEstimate ? "alta" : scored.length >= 3 ? "alta" : scored.length >= 1 ? "média" : "baixa",
    source: externalEstimate
      ? `Referência FipeX ${externalEstimate.referenceMonth}: ${externalEstimate.title}. Confirme na FIPE oficial quando fechar a precificação.`
      : localFipeEstimate
        ? "Referência calculada por veículos similares já cadastrados no estoque."
        : "Sem FIPE automática suficiente. Use a consulta oficial ou preencha manualmente.",
    externalProviderConfigured: Boolean(externalEstimate),
    externalEstimate,
    matches: scored.map(({ vehicle }) => ({
      title: vehicle.title,
      year: vehicle.year,
      price: vehicle.price,
      fipePrice: vehicle.fipePrice,
      purchasePrice: vehicle.purchasePrice,
    })),
  });
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreVehicle(title: string, tokens: string[], targetYear: number, vehicleYear: number): number {
  const normalizedTitle = normalize(title);
  const tokenScore = tokens.reduce((score, token) => score + (normalizedTitle.includes(token) ? 1 : 0), 0);
  const yearScore = targetYear && vehicleYear ? Math.max(0, 2 - Math.abs(targetYear - vehicleYear)) : 0;

  return tokenScore + yearScore;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function isVehicleType(value: string): value is "CAR" | "MOTORCYCLE" {
  return value === "CAR" || value === "MOTORCYCLE";
}
