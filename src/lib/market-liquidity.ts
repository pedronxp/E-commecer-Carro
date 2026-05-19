import { type MarketUf } from "./pricing-report";

export type LiquidityTone = "success" | "warning" | "danger" | "default";
export type MarketLiquidityConfidence = "baixa" | "media" | "alta";

type VehicleTypeForLiquidity = "CAR" | "MOTORCYCLE";
type TrendTone = "default" | "success" | "danger" | "warning";

type RegionalLiquidityProfile = {
  score: number;
  label: string;
  note: string;
};

export type MarketLiquidityInsight = {
  score: number;
  confidence: MarketLiquidityConfidence;
  tone: LiquidityTone;
  summary: string;
  bestPurchasePrice: number | null;
  competitivePurchasePrice: number | null;
  maxRiskPurchasePrice: number | null;
  purchaseDeltaToBest: number | null;
  resaleLikelihoodPercent: number;
  targetListingMin: number | null;
  targetListingMax: number | null;
  liquidityDiscountPercent: number;
  regionalProfile: RegionalLiquidityProfile;
  calculation: {
    formula: string;
    note: string;
    components: Array<{
      label: string;
      weight: number;
      score: number;
      contribution: number;
      detail: string;
    }>;
  };
  drivers: Array<{
    label: string;
    score: number;
    detail: string;
    tone: LiquidityTone;
  }>;
  sources: Array<{
    label: string;
    detail: string;
    url: string;
  }>;
};

export function buildMarketLiquidityInsight({
  marketUf,
  vehicleType,
  referencePrice,
  adjustedFipe,
  suggestedPrice,
  purchasePrice,
  maxRecommendedPurchasePrice,
  targetMargin,
  trendTone,
  fipeSpreadPercent,
  localSampleCount,
}: {
  marketUf: MarketUf;
  vehicleType: VehicleTypeForLiquidity;
  referencePrice?: number | null;
  adjustedFipe?: number | null;
  suggestedPrice?: number | null;
  purchasePrice?: number | null;
  maxRecommendedPurchasePrice?: number | null;
  targetMargin: number;
  trendTone?: TrendTone;
  fipeSpreadPercent?: number | null;
  localSampleCount?: number;
}): MarketLiquidityInsight {
  const regionalProfile = getRegionalLiquidityProfile(marketUf);
  const independentReference = normalizePositive(adjustedFipe) ?? normalizePositive(referencePrice);
  const safeSuggested = normalizePositive(suggestedPrice);
  const safeReference = independentReference;
  const safePurchase = normalizePositive(purchasePrice);
  const safeCeiling =
    normalizePositive(maxRecommendedPurchasePrice) ??
    (independentReference && targetMargin < 100 ? Math.round(independentReference * (1 - targetMargin / 100)) : null);
  const safeSpread = normalizePositive(fipeSpreadPercent) ?? 0;
  const discountPercent = getLiquidityDiscountPercent({
    regionalScore: regionalProfile.score,
    vehicleType,
    trendTone,
    fipeSpreadPercent: safeSpread,
  });
  const bestPurchasePrice = safeCeiling ? Math.round(safeCeiling * (1 - discountPercent / 100)) : null;
  const competitivePurchasePrice = safeCeiling ? Math.round((safeCeiling + (bestPurchasePrice ?? safeCeiling)) / 2) : null;
  const maxRiskPurchasePrice = safeCeiling;
  const purchaseDeltaToBest = safePurchase !== null && bestPurchasePrice !== null ? bestPurchasePrice - safePurchase : null;
  const pricePositionScore = scorePricePosition({ suggestedPrice: safeSuggested, referencePrice: safeReference });
  const purchaseScore = scorePurchase({ purchasePrice: safePurchase, bestPurchasePrice, ceiling: safeCeiling });
  const trendScore = scoreTrend({ trendTone, fipeSpreadPercent: safeSpread });
  const sampleScore = scoreSample(localSampleCount ?? 0);
  const calculationComponents = [
    {
      label: "UF e mercado",
      weight: 30,
      score: regionalProfile.score,
      detail: "Profundidade comercial estimada para a UF selecionada.",
    },
    {
      label: "Compra x teto",
      weight: 25,
      score: purchaseScore,
      detail: "Compara o valor de compra da loja com o melhor preco e o teto tecnico.",
    },
    {
      label: "Preco x FIPE",
      weight: 25,
      score: pricePositionScore,
      detail: "Mede se o anuncio sugerido fica competitivo contra a referencia nacional.",
    },
    {
      label: "Historico FIPE",
      weight: 14,
      score: trendScore,
      detail: "Usa tendencia e amplitude FIPE como sinal de estabilidade.",
    },
    {
      label: "Amostras locais",
      weight: 6,
      score: sampleScore,
      detail: "Valoriza comparaveis internos quando existem amostras suficientes.",
    },
  ];
  const score = clamp(
    Math.round(calculationComponents.reduce((total, component) => total + component.score * (component.weight / 100), 0)),
    0,
    100,
  );
  const confidence = getConfidence({ score, marketUf, hasReference: Boolean(safeReference), localSampleCount: localSampleCount ?? 0 });
  const tone = score >= 72 ? "success" : score >= 52 ? "warning" : "danger";
  const resaleLikelihoodPercent = clamp(Math.round(42 + score * 0.52), 35, 94);
  const listingSpread = tone === "success" ? 0.03 : tone === "warning" ? 0.05 : 0.08;
  const targetListingMin = safeReference ? Math.round(safeReference * (1 - listingSpread)) : null;
  const targetListingMax = safeReference ? Math.round(safeReference * (1 + listingSpread)) : null;

  return {
    score,
    confidence,
    tone,
    summary: buildSummary({ score, confidence, purchaseDeltaToBest, marketUf, regionalProfile }),
    bestPurchasePrice,
    competitivePurchasePrice,
    maxRiskPurchasePrice,
    purchaseDeltaToBest,
    resaleLikelihoodPercent,
    targetListingMin,
    targetListingMax,
    liquidityDiscountPercent: discountPercent,
    regionalProfile,
    calculation: {
      formula: "UF e mercado 30% + compra x teto 25% + preco x FIPE 25% + historico FIPE 14% + amostras locais 6%",
      note: "O resultado e um score comercial de liquidez, nao um preco FIPE regional. Ele aproxima risco de compra e revenda usando sinais disponiveis e transparentes.",
      components: calculationComponents.map((component) => ({
        ...component,
        contribution: Math.round(component.score * (component.weight / 100)),
      })),
    },
    drivers: [
      {
        label: "UF e mercado",
        score: regionalProfile.score,
        detail: regionalProfile.note,
        tone: regionalProfile.score >= 68 ? "success" : regionalProfile.score >= 54 ? "warning" : "default",
      },
      {
        label: "Compra x teto",
        score: purchaseScore,
        detail:
          bestPurchasePrice === null
            ? "Sem referencia independente para calcular melhor preco de compra."
            : purchaseDeltaToBest === null
            ? "Informe o valor de compra para medir folga real."
            : purchaseDeltaToBest >= 0
              ? `Compra com folga de ${formatCurrencyText(purchaseDeltaToBest)} contra o melhor preco.`
              : `Compra ${formatCurrencyText(Math.abs(purchaseDeltaToBest))} acima do melhor preco.`,
        tone: purchaseScore >= 70 ? "success" : purchaseScore >= 50 ? "warning" : "danger",
      },
      {
        label: "Preco x FIPE",
        score: pricePositionScore,
        detail: safeReference && safeSuggested ? describePricePosition(safeSuggested, safeReference) : "Referencia incompleta para medir posicao de anuncio.",
        tone: pricePositionScore >= 70 ? "success" : pricePositionScore >= 50 ? "warning" : "danger",
      },
      {
        label: "Historico FIPE",
        score: trendScore,
        detail: describeTrend(trendTone, safeSpread),
        tone: trendScore >= 70 ? "success" : trendScore >= 50 ? "warning" : "danger",
      },
    ],
    sources: [
      {
        label: "RENAVAM/SENATRAN",
        detail: "Base publica de frota por UF, municipio, marca e modelo; indicada para calibrar liquidez regional.",
        url: "https://dados.transportes.gov.br/dataset/registro-nacional-de-veiculos-automotores-renavam",
      },
      {
        label: "FENABRAVE",
        detail: "Sinal setorial de emplacamentos e dinamica de mercado para validar demanda por segmento.",
        url: "https://www.fenabrave.org.br/portalv2/",
      },
      {
        label: "FIPE/FipeX",
        detail: "Referencia nacional de preco; nao e alterada pela UF nesta camada.",
        url: "https://veiculos.fipe.org.br/",
      },
    ],
  };
}

function getRegionalLiquidityProfile(marketUf: MarketUf): RegionalLiquidityProfile {
  const high: MarketUf[] = ["SP", "MG", "PR", "RJ", "RS", "SC", "GO"];
  const balanced: MarketUf[] = ["BA", "PE", "CE", "DF", "ES", "MT", "MS", "PA"];
  const emerging: MarketUf[] = ["AM", "MA", "PB", "RN", "RO", "AL", "SE", "TO", "PI"];

  if (!marketUf) {
    return {
      score: 56,
      label: "Brasil",
      note: "Sem UF selecionada; liquidez usa media nacional conservadora.",
    };
  }

  if (high.includes(marketUf)) {
    return {
      score: 72,
      label: "Mercado amplo",
      note: "UF com maior profundidade de mercado; tende a ter mais comparaveis e giro melhor.",
    };
  }

  if (balanced.includes(marketUf)) {
    return {
      score: 62,
      label: "Mercado equilibrado",
      note: "UF com liquidez intermediaria; exige preco competitivo e conferencia local.",
    };
  }

  if (emerging.includes(marketUf)) {
    return {
      score: 54,
      label: "Mercado seletivo",
      note: "UF com giro mais dependente de modelo, financiamento e preco de entrada.",
    };
  }

  return {
    score: 48,
    label: "Mercado restrito",
    note: "UF com menor profundidade de amostra; use compra mais conservadora e valide demanda local.",
  };
}

function getLiquidityDiscountPercent({
  regionalScore,
  vehicleType,
  trendTone,
  fipeSpreadPercent,
}: {
  regionalScore: number;
  vehicleType: VehicleTypeForLiquidity;
  trendTone?: TrendTone;
  fipeSpreadPercent: number;
}) {
  let discount = regionalScore >= 70 ? 3 : regionalScore >= 58 ? 5 : 7;
  if (vehicleType === "MOTORCYCLE") discount += 1;
  if (trendTone === "danger") discount += 2;
  if (trendTone === "success") discount -= 1;
  if (fipeSpreadPercent >= 10) discount += 2;
  if (fipeSpreadPercent >= 18) discount += 2;
  return clamp(discount, 2, 14);
}

function scorePricePosition({ suggestedPrice, referencePrice }: { suggestedPrice: number | null; referencePrice: number | null }) {
  if (!suggestedPrice || !referencePrice) return 42;
  const ratio = suggestedPrice / referencePrice;
  if (ratio <= 0.97) return 86;
  if (ratio <= 1.03) return 76;
  if (ratio <= 1.08) return 58;
  if (ratio <= 1.14) return 44;
  return 30;
}

function scorePurchase({
  purchasePrice,
  bestPurchasePrice,
  ceiling,
}: {
  purchasePrice: number | null;
  bestPurchasePrice: number | null;
  ceiling: number | null;
}) {
  if (!purchasePrice || !bestPurchasePrice || !ceiling) return 46;
  if (purchasePrice <= bestPurchasePrice) return 88;
  if (purchasePrice <= ceiling) return 66;
  const overRatio = purchasePrice / ceiling;
  if (overRatio <= 1.05) return 42;
  if (overRatio <= 1.12) return 28;
  return 18;
}

function scoreTrend({ trendTone, fipeSpreadPercent }: { trendTone?: TrendTone; fipeSpreadPercent: number }) {
  let score = trendTone === "success" ? 76 : trendTone === "danger" ? 42 : trendTone === "warning" ? 50 : 64;
  if (fipeSpreadPercent >= 8) score -= 8;
  if (fipeSpreadPercent >= 15) score -= 10;
  return clamp(score, 10, 90);
}

function scoreSample(localSampleCount: number) {
  if (localSampleCount >= 5) return 78;
  if (localSampleCount >= 2) return 62;
  if (localSampleCount === 1) return 50;
  return 40;
}

function getConfidence({
  score,
  marketUf,
  hasReference,
  localSampleCount,
}: {
  score: number;
  marketUf: MarketUf;
  hasReference: boolean;
  localSampleCount: number;
}): MarketLiquidityConfidence {
  if (!hasReference) return "baixa";
  if (score >= 70 && marketUf && localSampleCount >= 2) return "alta";
  if (marketUf || localSampleCount >= 1) return "media";
  return "baixa";
}

function buildSummary({
  score,
  confidence,
  purchaseDeltaToBest,
  marketUf,
  regionalProfile,
}: {
  score: number;
  confidence: MarketLiquidityConfidence;
  purchaseDeltaToBest: number | null;
  marketUf: MarketUf;
  regionalProfile: RegionalLiquidityProfile;
}) {
  const ufText = marketUf ? `em ${marketUf}` : "no Brasil";
  const base = `Liquidez ${score >= 72 ? "favoravel" : score >= 52 ? "moderada" : "sensivel"} ${ufText}; confianca ${confidence}.`;
  const purchaseText =
    purchaseDeltaToBest === null
      ? " Sem melhor preco de compra calculado quando falta referencia independente."
      : purchaseDeltaToBest >= 0
        ? ` Compra esta ${formatCurrencyText(purchaseDeltaToBest)} abaixo do melhor preco.`
        : ` Compra esta ${formatCurrencyText(Math.abs(purchaseDeltaToBest))} acima do melhor preco.`;
  return `${base} ${regionalProfile.label}. ${purchaseText}`;
}

function describePricePosition(suggestedPrice: number, referencePrice: number) {
  const percent = Math.round(((suggestedPrice - referencePrice) / referencePrice) * 100);
  if (percent <= -3) return `Anuncio ${Math.abs(percent)}% abaixo da referencia; tende a favorecer giro.`;
  if (percent <= 3) return "Anuncio proximo da referencia; leitura equilibrada.";
  return `Anuncio ${percent}% acima da referencia; pode reduzir liquidez se mercado estiver frio.`;
}

function describeTrend(trendTone?: TrendTone, fipeSpreadPercent = 0) {
  const spreadText = fipeSpreadPercent ? ` Amplitude FIPE: ${fipeSpreadPercent}%.` : "";
  if (trendTone === "success") return `Historico favoravel, sem garantia futura.${spreadText}`;
  if (trendTone === "danger") return `Historico em queda; compre com margem de seguranca maior.${spreadText}`;
  if (trendTone === "warning") return `Historico insuficiente; leitura com baixa confianca.${spreadText}`;
  return `Historico estavel ou sem oscilacao relevante.${spreadText}`;
}

function normalizePositive(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatCurrencyText(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
