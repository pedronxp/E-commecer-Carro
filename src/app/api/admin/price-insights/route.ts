import { NextResponse } from "next/server";
import { requireInternalAccess } from "@/lib/api";
import { findFipexEstimate } from "@/lib/fipe-provider";
import { buildPriceDecision, buildPriceGuidance, normalizePriceCondition, normalizeTargetMargin, parseMoneyText } from "@/lib/price-comparison";
import { buildPriceInsightSearchFilters, normalizeSearchText, scoreLocalPriceCandidate } from "@/lib/price-insight-filters";
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
  const conditionKey = normalizePriceCondition(searchParams.get("condition"));
  const targetMargin = normalizeTargetMargin(searchParams.get("targetMargin"));
  const modelId = normalizeOptional(searchParams.get("modelId") ?? searchParams.get("compareModelId"));
  const modelSlug = normalizeOptional(searchParams.get("modelSlug") ?? searchParams.get("compareModelSlug"));
  const fuelId = normalizeOptional(searchParams.get("fuelId") ?? searchParams.get("compareFuelId"));
  const fuelAcronym = normalizeOptional(searchParams.get("fuelAcronym") ?? searchParams.get("compareFuelAcronym"));
  const purchasePrice = parseMoneyText(
    searchParams.get("purchasePrice") ?? searchParams.get("cost") ?? searchParams.get("compareCost"),
  );
  const currentPrice = parseMoneyText(
    searchParams.get("currentPrice") ?? searchParams.get("salePrice") ?? searchParams.get("compareSalePrice"),
  );
  const searchFilters = buildPriceInsightSearchFilters({ title, year });
  const { tokens, targetYear, yearWindow, minimumTokenMatches } = searchFilters;
  const parameters = {
    title,
    year: targetYear,
    vehicleType,
    normalizedVehicleType: vehicleType === "ELECTRIC_BIKE" ? "ELECTRIC_BIKE" : safeVehicleType,
    conditionKey,
    targetMargin,
    purchasePrice,
    currentPrice,
    tokens,
    priceFilters: {
      yearWindow,
      minimumTokenMatches,
      maxYearDistance: yearWindow ? 2 : null,
    },
    providerHints: {
      modelId,
      modelSlug,
      fuelId,
      fuelAcronym,
    },
  };
  const manualDecision = buildPriceDecision({ purchasePrice, currentPrice, targetMargin, conditionKey });
  const manualGuidance = buildPriceGuidance(manualDecision);

  if (vehicleType === "ELECTRIC_BIKE") {
    return NextResponse.json({
      fipeEstimate: null,
      averageSalePrice: null,
      decision: manualDecision,
      guidance: manualGuidance,
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
      decision: manualDecision,
      guidance: manualGuidance,
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
        ...(yearWindow ? { year: { gte: yearWindow.min, lte: yearWindow.max } } : {}),
        OR: tokens.map((token) => ({ title: { contains: token, mode: "insensitive" as const } })),
      },
      take: 24,
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
      year: targetYear ?? undefined,
      vehicleType: safeVehicleType,
      modelId,
      modelSlug,
      fuelId,
      fuelAcronym,
    }),
  ]);

  const scored = candidates
    .map((vehicle) => {
      const score = scoreVehicle(vehicle.title, tokens, targetYear, vehicle.year, minimumTokenMatches);

      return {
        vehicle,
        ...score,
      };
    })
    .filter((item) => item.accepted)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const fipeValues = scored
    .map((item) => item.vehicle.fipePrice)
    .filter((value): value is number => typeof value === "number" && value > 0);
  const saleValues = scored.map((item) => item.vehicle.price).filter((value) => value > 0);

  const localFipeEstimate = average(fipeValues);
  const fipeEstimate = externalEstimate?.price ?? localFipeEstimate;
  const averageSalePrice = average(saleValues);
  const decision = buildPriceDecision({
    fipePrice: fipeEstimate,
    purchasePrice,
    currentPrice: currentPrice ?? averageSalePrice,
    targetMargin,
    conditionKey,
  });
  const guidance = buildPriceGuidance(decision);
  const fallbackReason = externalEstimate
    ? null
    : localFipeEstimate
      ? "Fornecedor externo sem match confiavel; usando referencia interna por estoque similar."
      : "Sem match externo ou interno suficiente; informe a referencia manualmente.";

  return NextResponse.json({
    fipeEstimate,
    averageSalePrice,
    decision,
    guidance,
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
    matches: scored.map(({ vehicle, score, tokenMatches, requiredTokenMatches, yearDistance }) => ({
      title: vehicle.title,
      year: vehicle.year,
      price: vehicle.price,
      fipePrice: vehicle.fipePrice,
      purchasePrice: vehicle.purchasePrice,
      score,
      tokenMatches,
      requiredTokenMatches,
      yearDistance,
    })),
  });
}

function normalize(value: string): string {
  return normalizeSearchText(value);
}

function normalizeOptional(value?: string | null): string | null {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

function scoreVehicle(title: string, tokens: string[], targetYear: number | null, vehicleYear: number, minimumTokenMatches: number) {
  return scoreLocalPriceCandidate({
    candidateTitle: title,
    tokens,
    targetYear,
    vehicleYear,
    minimumTokenMatches,
  });
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function isVehicleType(value: string): value is "CAR" | "MOTORCYCLE" {
  return value === "CAR" || value === "MOTORCYCLE";
}
