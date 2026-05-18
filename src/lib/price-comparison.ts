export const priceConditionAdjustments = {
  excellent: { label: "Excelente", factor: 1.03 },
  good: { label: "Bom", factor: 1 },
  attention: { label: "Com detalhes", factor: 0.95 },
  repair: { label: "Precisa reparos", factor: 0.9 },
} as const;

export type PriceConditionKey = keyof typeof priceConditionAdjustments;

export type PriceDecision = {
  conditionKey: PriceConditionKey;
  conditionLabel: string;
  conditionFactor: number;
  targetMargin: number;
  adjustedFipe: number | null;
  suggestedByFipe: number | null;
  suggestedByMargin: number | null;
  suggestedByCurrentPrice: number | null;
  suggestedPrice: number | null;
  grossMargin: number | null;
  marginPercent: number | null;
  discountPercent: number;
  basis: Array<"fipe" | "margin" | "current-price">;
  hasDecision: boolean;
};

export type PriceGuidance = {
  tone: "success" | "warning" | "danger";
  title: string;
  detail: string;
  suggestions: string[];
};

export function buildPriceDecision({
  fipePrice,
  purchasePrice,
  currentPrice,
  targetMargin = 12,
  conditionKey = "good",
}: {
  fipePrice?: number | null;
  purchasePrice?: number | null;
  currentPrice?: number | null;
  targetMargin?: number;
  conditionKey?: PriceConditionKey;
}): PriceDecision {
  const condition = priceConditionAdjustments[conditionKey];
  const safeFipePrice = normalizePositiveNumber(fipePrice);
  const safePurchasePrice = normalizePositiveNumber(purchasePrice);
  const safeCurrentPrice = normalizePositiveNumber(currentPrice);
  const safeTargetMargin = normalizeTargetMargin(targetMargin);
  const adjustedFipe = safeFipePrice ? Math.round(safeFipePrice * condition.factor) : null;
  const suggestedByFipe = adjustedFipe;
  const suggestedByMargin =
    safePurchasePrice && safeTargetMargin < 100
      ? Math.round(safePurchasePrice / (1 - safeTargetMargin / 100))
      : null;
  const suggestedByCurrentPrice = safeCurrentPrice ? Math.round(safeCurrentPrice) : null;
  const basis: PriceDecision["basis"] = [];
  const primaryCandidates: number[] = [];

  if (suggestedByFipe) {
    basis.push("fipe");
    primaryCandidates.push(suggestedByFipe);
  }

  if (suggestedByMargin) {
    basis.push("margin");
    primaryCandidates.push(suggestedByMargin);
  }

  if (primaryCandidates.length === 0 && suggestedByCurrentPrice) {
    basis.push("current-price");
  }

  const suggestedPrice = primaryCandidates.length
    ? Math.max(...primaryCandidates)
    : suggestedByCurrentPrice;
  const grossMargin = suggestedPrice !== null && safePurchasePrice ? suggestedPrice - safePurchasePrice : null;
  const marginPercent =
    suggestedPrice !== null && suggestedPrice > 0 && grossMargin !== null
      ? Math.round((grossMargin / suggestedPrice) * 100)
      : null;
  const discountPercent =
    adjustedFipe !== null && suggestedPrice !== null && adjustedFipe > suggestedPrice
      ? Math.round(((adjustedFipe - suggestedPrice) / adjustedFipe) * 100)
      : 0;

  return {
    conditionKey,
    conditionLabel: condition.label,
    conditionFactor: condition.factor,
    targetMargin: safeTargetMargin,
    adjustedFipe,
    suggestedByFipe,
    suggestedByMargin,
    suggestedByCurrentPrice,
    suggestedPrice,
    grossMargin,
    marginPercent,
    discountPercent,
    basis,
    hasDecision: suggestedPrice !== null,
  };
}

export function buildPriceGuidance(decision: PriceDecision): PriceGuidance {
  const suggestions: string[] = [];

  if (!decision.adjustedFipe) {
    suggestions.push("Selecione um modelo FIPE/FipeX ou informe o preço atual FIPE manualmente.");
  }

  if (!decision.suggestedByMargin) {
    suggestions.push("Informe o valor que pretende pagar para calcular lucro bruto e margem real.");
  }

  if (!decision.hasDecision) {
    return {
      tone: "warning",
      title: "Dados insuficientes para recomendar preço",
      detail: "O sistema precisa de FIPE, preço atual informado ou valor pretendido de compra para montar uma decisão.",
      suggestions,
    };
  }

  if (decision.grossMargin !== null && decision.marginPercent !== null && decision.marginPercent < decision.targetMargin) {
    const maxIntendedPayment = decision.suggestedPrice
      ? Math.round(decision.suggestedPrice * (1 - decision.targetMargin / 100))
      : null;

    suggestions.push(
      maxIntendedPayment
        ? `Para manter ${decision.targetMargin}% de margem neste preço, tente pagar no máximo ${formatCurrencyForGuidance(maxIntendedPayment)}.`
        : "Revise o valor pretendido de compra ou aumente o preço sugerido.",
    );

    return {
      tone: "danger",
      title: "Margem abaixo da meta",
      detail: `A margem calculada ficou em ${decision.marginPercent}%, abaixo da meta de ${decision.targetMargin}%.`,
      suggestions,
    };
  }

  if (!decision.adjustedFipe || !decision.suggestedByMargin) {
    return {
      tone: "warning",
      title: "Decisão parcial",
      detail: "Há preço sugerido, mas falta referência para uma decisão completa.",
      suggestions,
    };
  }

  suggestions.push("Use o preço sugerido como referência inicial e confirme a FIPE oficial antes de fechar a negociação.");

  return {
    tone: "success",
    title: "Decisão consistente",
    detail: `Preço sugerido cobre a meta de ${decision.targetMargin}% quando o valor pretendido de compra está correto.`,
    suggestions,
  };
}

export function normalizePriceCondition(value?: string | null): PriceConditionKey {
  return value && value in priceConditionAdjustments ? (value as PriceConditionKey) : "good";
}

export function normalizeTargetMargin(value?: string | number | null, fallback = 12): number {
  if (value === null || value === undefined || value === "") return fallback;

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 80) return fallback;
  return parsed;
}

export function parseMoneyText(value?: string | null): number | null {
  if (!value) return null;
  const clean = value.replace(/[^\d,.-]/g, "").trim();
  if (!clean) return null;

  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean.split(".").length > 2
      ? clean.replace(/\./g, "")
      : clean;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizePositiveNumber(value?: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function formatCurrencyForGuidance(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
