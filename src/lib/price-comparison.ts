export const priceConditionAdjustments = {
  excellent: {
    label: "Excelente",
    factor: 1.03,
    optionLabel: "Excelente (+3%)",
    decisionLabel: "FIPE com valorizacao por excelente estado",
    description: "Veiculo acima da media, com baixa necessidade de preparo e maior poder de negociacao.",
    effect: "Aumenta a referencia FIPE em 3%.",
  },
  good: {
    label: "Bom",
    factor: 1,
    optionLabel: "Bom / sem ajuste",
    decisionLabel: "FIPE sem ajuste de conservacao",
    description: "Estado comercial normal para anuncio, sem premio nem desconto sobre a referencia FIPE.",
    effect: "Mantem a FIPE original.",
  },
  attention: {
    label: "Com detalhes",
    factor: 0.95,
    optionLabel: "Com detalhes (-5%)",
    decisionLabel: "FIPE ajustada por detalhes",
    description: "Pequenos reparos, estetica ou revisao podem reduzir o teto de compra.",
    effect: "Reduz a referencia FIPE em 5%.",
  },
  repair: {
    label: "Precisa reparos",
    factor: 0.9,
    optionLabel: "Precisa reparos (-10%)",
    decisionLabel: "FIPE ajustada por reparos",
    description: "Reparos relevantes exigem cautela no valor de entrada para preservar margem.",
    effect: "Reduz a referencia FIPE em 10%.",
  },
} as const;

export type PriceConditionKey = keyof typeof priceConditionAdjustments;
export type PriceConditionOptionKey = PriceConditionKey | "";

export const defaultPriceConditionOption = {
  key: "" as const,
  label: "Sem ajuste",
  factor: 1,
  optionLabel: "Sem ajuste",
  decisionLabel: "FIPE sem ajuste informado",
  description: "Use quando a conservacao ainda nao foi avaliada. O calculo usa a FIPE original.",
  effect: "Mantem a FIPE original ate existir avaliacao real.",
};

export const priceConditionSelectOptions: Array<{
  key: PriceConditionOptionKey;
  label: string;
  factor: number;
  optionLabel: string;
  decisionLabel: string;
  description: string;
  effect: string;
}> = [
  defaultPriceConditionOption,
  ...Object.entries(priceConditionAdjustments).map(([key, value]) => ({
    key: key as PriceConditionKey,
    ...value,
  })),
];

export function getPriceConditionOption(value?: string | null) {
  return priceConditionSelectOptions.find((option) => option.key === (value ?? "")) ?? defaultPriceConditionOption;
}

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
  purchasePrice: number | null;
  grossMargin: number | null;
  marginPercent: number | null;
  discountPercent: number;
  recommendedPurchaseReferencePrice: number | null;
  maxRecommendedPurchasePrice: number | null;
  purchaseExceedsRecommendedPrice: boolean;
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
  const recommendedPurchaseReferencePrice = adjustedFipe ?? suggestedByCurrentPrice;
  const maxRecommendedPurchasePrice =
    recommendedPurchaseReferencePrice !== null && safeTargetMargin < 100
      ? Math.round(recommendedPurchaseReferencePrice * (1 - safeTargetMargin / 100))
      : null;
  const purchaseExceedsRecommendedPrice =
    safePurchasePrice !== null &&
    maxRecommendedPurchasePrice !== null &&
    safePurchasePrice > maxRecommendedPurchasePrice;

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
    purchasePrice: safePurchasePrice,
    grossMargin,
    marginPercent,
    discountPercent,
    recommendedPurchaseReferencePrice,
    maxRecommendedPurchasePrice,
    purchaseExceedsRecommendedPrice,
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
    suggestions.push("Informe o valor de compra da loja para calcular lucro bruto e margem real.");
  }

  if (!decision.hasDecision) {
    return {
      tone: "warning",
      title: "Dados insuficientes para recomendar preço",
      detail: "O sistema precisa de FIPE, preço atual informado ou valor de compra da loja para montar uma decisão.",
      suggestions,
    };
  }

  if (decision.purchaseExceedsRecommendedPrice && decision.maxRecommendedPurchasePrice && decision.purchasePrice) {
    const excess = decision.purchasePrice - decision.maxRecommendedPurchasePrice;
    suggestions.push(
      `Negocie a compra ate ${formatCurrencyForGuidance(decision.maxRecommendedPurchasePrice)} ou trate ${formatCurrencyForGuidance(excess)} como risco acima do teto.`,
    );

    if (decision.suggestedByMargin) {
      suggestions.push(
        `Para preservar ${decision.targetMargin}% com esse custo, o anuncio minimo sobe para ${formatCurrencyForGuidance(decision.suggestedByMargin)}.`,
      );
    }

    return {
      tone: "danger",
      title: "Compra acima do teto recomendado",
      detail: `O valor de compra da loja ultrapassa o teto calculado pela referencia FIPE/conservacao e margem minima de ${decision.targetMargin}%.`,
      suggestions,
    };
  }

  if (decision.grossMargin !== null && decision.marginPercent !== null && decision.marginPercent < decision.targetMargin) {
    const maxIntendedPayment = decision.maxRecommendedPurchasePrice;

    suggestions.push(
      maxIntendedPayment
        ? `Para manter ${decision.targetMargin}% de margem neste preco, negocie a compra ate ${formatCurrencyForGuidance(maxIntendedPayment)} ou ajuste a estrategia de anuncio.`
        : "Revise o valor de compra da loja ou aumente o preco sugerido.",
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

  suggestions.push("Use o preco sugerido como referencia inicial de anuncio e confirme a FIPE oficial antes de fechar a negociacao.");

  return {
    tone: "success",
    title: "Decisão consistente",
    detail: `Preco sugerido cobre a meta de ${decision.targetMargin}% quando o valor de compra da loja esta correto.`,
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
