import { NextResponse } from "next/server";
import { requireInternalAccess } from "@/lib/api";
import { findFipexEstimate } from "@/lib/fipe-provider";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireInternalAccess();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const title = normalize(searchParams.get("title") || "");
  const year = Number(searchParams.get("year") || "");
  const vehicleType = searchParams.get("vehicleType") || "CAR";
  const safeVehicleType = isVehicleType(vehicleType) ? vehicleType : "CAR";
  const tokens = title.split(" ").filter((token) => token.length >= 3).slice(0, 5);
  const parameters = {
    title,
    year: Number.isFinite(year) ? year : null,
    vehicleType,
    normalizedVehicleType: vehicleType === "ELECTRIC_BIKE" ? "ELECTRIC_BIKE" : safeVehicleType,
    tokens,
  };

  if (vehicleType === "ELECTRIC_BIKE") {
    return NextResponse.json({
      fipeEstimate: null,
      averageSalePrice: null,
      sampleCount: 0,
      confidence: "manual",
      source: "Bike eletrica nao possui cobertura FIPE confiavel neste fluxo. Informe o preco de referencia manualmente.",
      fallbackReason: "Tipo de veiculo sem cobertura FIPE automatica neste fluxo.",
      externalProviderConfigured: false,
      providerStatus: "manual",
      parameters,
      matches: [],
    });
  }

  if (tokens.length === 0) {
    return NextResponse.json({
      fipeEstimate: null,
      averageSalePrice: null,
      sampleCount: 0,
      confidence: "manual",
      source: "Digite o nome do veiculo para buscar referencia no estoque local e na FipeX.",
      fallbackReason: "Titulo insuficiente para consulta automatica.",
      externalProviderConfigured: false,
      providerStatus: "manual",
      parameters,
      matches: [],
    });
  }

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
  const fallbackReason = externalEstimate
    ? null
    : localFipeEstimate
      ? "Fornecedor externo sem match confiavel; usando referencia interna por estoque similar."
      : "Sem match externo ou interno suficiente; informe a referencia manualmente.";

  return NextResponse.json({
    fipeEstimate,
    averageSalePrice,
    sampleCount: scored.length,
    confidence: externalEstimate ? externalEstimate.confidence : scored.length >= 3 ? "alta" : scored.length >= 1 ? "media" : "baixa",
    source: externalEstimate
      ? `Referencia FipeX ${externalEstimate.referenceMonth}: ${externalEstimate.title}. Confirme na FIPE oficial quando fechar a precificacao.`
      : localFipeEstimate
        ? "Referencia calculada por veiculos similares ja cadastrados no estoque."
        : "Sem FIPE automatica suficiente. Use a consulta oficial ou preencha manualmente.",
    fallbackReason,
    externalProviderConfigured: Boolean(externalEstimate),
    providerStatus: externalEstimate ? "provider" : localFipeEstimate ? "local-fallback" : "manual",
    parameters,
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
