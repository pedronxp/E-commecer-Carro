export type FipeProviderVehicleType = "CAR" | "MOTORCYCLE";

type FipexSearchItem = {
  price_id?: string;
  model_id?: string;
  model_name?: string;
  model_slug?: string;
  make_id?: string;
  make_name?: string;
  make_slug?: string;
  fuel_id?: string;
  fuel_name?: string;
  fuel_acroym?: string;
  fuel_acronym?: string;
  model_year?: number;
  latest_market_price_cents?: number;
  type_id?: string;
  type_name?: string;
  latest_ref_id?: string;
  ref_month?: number;
  ref_year?: number;
  ref_fipe_id?: number | string;
  ref_ingested_at?: string;
  score?: number;
};

type FipexExpandedPayload = {
  data?: {
    price?: {
      price?: number;
      formatted_price?: string;
      model_year?: number;
      query_date?: string;
      make?: { id?: string; name?: string; slug?: string };
      model?: { id?: string; name?: string; slug?: string; make_id?: string };
      fuel?: { id?: string; acronym?: string; name?: string };
      type?: { id?: string; name?: string; slug?: string };
      reference?: { id?: string; month?: number; month_name?: string; year?: number };
    };
    analytics?: {
      change_from_previous_month_pct?: number | null;
      change_from_launch_pct?: number | null;
      peak_to_now_pct_change?: number | null;
      price_volatility?: number | null;
      price_rank?: number | null;
      price_rank_total_in_category?: number | null;
      value_retention_pct?: number | null;
      annual_depreciation_rate?: number | null;
      lifecycle_status?: string | null;
      anomaly_status?: string | null;
      anomaly_z_score?: number | null;
    };
    history?: Array<{
      year?: number;
      month?: number;
      market_price_cents?: number;
      formatted_price?: string;
    }>;
    available_years?: Array<{ model_year?: number }>;
  };
};

export type FipeModelSuggestion = {
  title: string;
  makeName: string;
  modelName: string;
  fuelName?: string;
  year: number;
  price: number;
  referenceMonth: string;
  provider: "FipeX";
  priceId?: string;
  modelId?: string;
  modelSlug?: string;
  makeId?: string;
  makeSlug?: string;
  fuelId?: string;
  fuelAcronym?: string;
  typeId?: string;
  referenceId?: string;
  referenceCode?: number | string;
  matchScore?: number;
};

export type FipePriceHistoryPoint = {
  year: number;
  month: number;
  price: number;
  referenceMonth: string;
  label: string;
};

export type FipeExpandedAnalytics = {
  changeFromPreviousMonthPercent?: number | null;
  changeFromLaunchPercent?: number | null;
  peakToNowPercentChange?: number | null;
  priceVolatility?: number | null;
  priceRank?: number | null;
  priceRankTotalInCategory?: number | null;
  valueRetentionPercent?: number | null;
  annualDepreciationRate?: number | null;
  lifecycleStatus?: string | null;
  anomalyStatus?: string | null;
  anomalyZScore?: number | null;
};

export type FipeEstimate = {
  provider: "FipeX";
  title: string;
  year: number;
  price: number;
  referenceMonth: string;
  referenceCode?: number | string;
  referenceId?: string;
  ingestedAt?: string;
  confidence: "alta" | "media" | "baixa";
  matchScore: number;
  fallback: false;
  priceId?: string;
  modelId?: string;
  modelSlug?: string;
  makeId?: string;
  makeSlug?: string;
  makeName?: string;
  modelName?: string;
  fuelId?: string;
  fuelAcronym?: string;
  fuelName?: string;
  typeId?: string;
  typeName?: string;
  analytics?: FipeExpandedAnalytics;
  history?: FipePriceHistoryPoint[];
  availableYears?: number[];
};

export type FipeExpandedPrice = {
  estimate: FipeEstimate;
  history: FipePriceHistoryPoint[];
  analytics?: FipeExpandedAnalytics;
  availableYears: number[];
};

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

const FIPEX_BASE_URL = "https://api.fipex.com.br";
const FIPEX_REQUEST_TIMEOUT_MS = 6500;
const FIPEX_TYPE_NAMES: Record<FipeProviderVehicleType, string> = {
  CAR: "carro",
  MOTORCYCLE: "moto",
};

const MONTHS = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

export async function findFipexEstimate({
  title,
  year,
  vehicleType,
  modelId,
  modelSlug,
  fuelId,
  fuelAcronym,
  fetcher = fetch,
}: {
  title: string;
  year?: number;
  vehicleType: FipeProviderVehicleType;
  modelId?: string | null;
  modelSlug?: string | null;
  fuelId?: string | null;
  fuelAcronym?: string | null;
  fetcher?: FetchLike;
}): Promise<FipeEstimate | null> {
  const query = normalizeSearchText(title);

  if (year && (modelId || modelSlug) && (fuelId || fuelAcronym)) {
    const expanded = await getFipexExpandedPrice({
      modelId,
      modelSlug,
      fuelId,
      fuelAcronym,
      year,
      fetcher,
    });

    if (expanded) {
      return {
        ...expanded.estimate,
        confidence: "alta",
        matchScore: 100,
      };
    }
  }

  if (query.length < 3) return null;

  const url = new URL("/v1/search", FIPEX_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");

  try {
    const response = await fetcher(url, createFipexFetchInit());

    if (!response.ok) return null;

    const payload = (await response.json()) as { data?: FipexSearchItem[] };
    const selected = selectBestFipexMatch(payload.data ?? [], {
      title,
      year,
      vehicleType,
    });

    if (!selected) return null;

    const expanded = await getFipexExpandedPrice({
      modelId: selected.modelId,
      modelSlug: selected.modelSlug,
      fuelId: selected.fuelId,
      fuelAcronym: selected.fuelAcronym,
      year: selected.year,
      fetcher,
    });

    if (!expanded) return selected;

    return {
      ...expanded.estimate,
      confidence: selected.confidence,
      matchScore: selected.matchScore,
      priceId: selected.priceId ?? expanded.estimate.priceId,
      referenceCode: selected.referenceCode ?? expanded.estimate.referenceCode,
    };
  } catch {
    return null;
  }
}

export async function getFipexExpandedPrice({
  modelId,
  modelSlug,
  fuelId,
  fuelAcronym,
  year,
  fetcher = fetch,
}: {
  modelId?: string | null;
  modelSlug?: string | null;
  fuelId?: string | null;
  fuelAcronym?: string | null;
  year?: number | null;
  fetcher?: FetchLike;
}): Promise<FipeExpandedPrice | null> {
  if (!year || (!(modelId || modelSlug)) || (!(fuelId || fuelAcronym))) return null;

  const url = new URL("/v1/prices/expanded", FIPEX_BASE_URL);
  if (modelId) url.searchParams.set("model_id", modelId);
  else if (modelSlug) url.searchParams.set("model_slug", modelSlug);

  if (fuelId) url.searchParams.set("fuel_id", fuelId);
  else if (fuelAcronym) url.searchParams.set("fuel_acronym", fuelAcronym);

  url.searchParams.set("year", String(year));

  try {
    const response = await fetcher(url, createFipexFetchInit());
    if (!response.ok) return null;

    const payload = (await response.json()) as FipexExpandedPayload;
    return mapFipexExpandedPrice(payload);
  } catch {
    return null;
  }
}

export async function findFipexModelSuggestions({
  query,
  vehicleType,
  includeOlderModels = false,
  fetcher = fetch,
}: {
  query: string;
  vehicleType: FipeProviderVehicleType;
  includeOlderModels?: boolean;
  fetcher?: FetchLike;
}): Promise<FipeModelSuggestion[]> {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < 2) return [];
  const targetYear = extractYearFromText(query);

  const url = new URL("/v1/search", FIPEX_BASE_URL);
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("limit", includeOlderModels || targetYear ? "80" : "24");
  url.searchParams.set("order_by", "-year");

  try {
    const response = await fetcher(url, createFipexFetchInit());

    if (!response.ok) return [];

    const payload = (await response.json()) as { data?: FipexSearchItem[] };
    return mapFipexSuggestions(payload.data ?? [], vehicleType, {
      limit: includeOlderModels ? 20 : 8,
      targetYear,
    });
  } catch {
    return [];
  }
}

export function mapFipexSuggestions(
  items: FipexSearchItem[],
  vehicleType: FipeProviderVehicleType,
  { limit = 8, targetYear = null }: { limit?: number; targetYear?: number | null } = {},
): FipeModelSuggestion[] {
  const expectedType = FIPEX_TYPE_NAMES[vehicleType];
  const seen = new Set<string>();

  const suggestions = items
    .filter((item) => item.type_name === expectedType)
    .filter(
      (item) =>
        Boolean(item.make_name) &&
        Boolean(item.model_name) &&
        typeof item.model_year === "number" &&
        typeof item.latest_market_price_cents === "number" &&
        item.latest_market_price_cents > 0,
    )
    .map((item) => {
      const suggestion: FipeModelSuggestion = {
          title: cleanFipeTitle(`${item.make_name} ${item.model_name}`),
          makeName: item.make_name as string,
          modelName: cleanFipeTitle(item.model_name as string),
          fuelName: item.fuel_name,
          year: item.model_year as number,
          price: Math.round((item.latest_market_price_cents as number) / 100),
          referenceMonth: formatReferenceMonth(item.ref_month, item.ref_year),
          provider: "FipeX" as const,
        };

      return withFipexSearchMeta(suggestion, item);
    })
    .filter((suggestion) => {
      const key = `${suggestion.title}-${suggestion.fuelName ?? ""}-${suggestion.year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      if (!targetYear) return b.year - a.year;

      const aDistance = Math.abs(a.year - targetYear);
      const bDistance = Math.abs(b.year - targetYear);
      if (aDistance !== bDistance) return aDistance - bDistance;
      return b.price - a.price;
    });

  const exactYearSuggestions = targetYear
    ? suggestions.filter((suggestion) => suggestion.year === targetYear)
    : [];

  return (exactYearSuggestions.length > 0 ? exactYearSuggestions : suggestions)
    .slice(0, limit);
}

export function selectBestFipexMatch(
  items: FipexSearchItem[],
  {
    title,
    year,
    vehicleType,
  }: {
    title: string;
    year?: number;
    vehicleType: FipeProviderVehicleType;
  },
): FipeEstimate | null {
  const expectedType = FIPEX_TYPE_NAMES[vehicleType];
  const queryTokens = buildQueryTokens(title);
  if (queryTokens.length === 0) return null;

  const ranked = items
    .filter((item) => item.type_name === expectedType)
    .filter((item) => typeof item.latest_market_price_cents === "number" && item.latest_market_price_cents > 0)
    .map((item) => {
      const tokenMatches = countFipexTokenMatches(item, queryTokens);
      const yearDistance = year && item.model_year ? Math.abs(year - item.model_year) : null;

      return {
        item,
        tokenMatches,
        yearDistance,
        score: scoreFipexItem(item, queryTokens, year),
      };
    })
    .filter(({ score, tokenMatches, yearDistance }) =>
      isUsableFipexMatch({
        score,
        tokenMatches,
        queryTokenCount: queryTokens.length,
        yearDistance,
      }),
    )
    .sort((a, b) => b.score - a.score);

  const bestRanked = ranked[0];
  const best = bestRanked?.item;
  if (!best?.model_name || !best.make_name || !best.model_year || !best.latest_market_price_cents) {
    return null;
  }

  const matchScore = bestRanked.score;

  return withFipexSearchMeta(
    {
      provider: "FipeX",
      title: cleanFipeTitle(`${best.make_name} ${best.model_name}${best.fuel_name ? ` ${best.fuel_name}` : ""}`),
      year: best.model_year,
      price: Math.round(best.latest_market_price_cents / 100),
      referenceMonth: formatReferenceMonth(best.ref_month, best.ref_year),
      referenceCode: best.ref_fipe_id,
      ingestedAt: best.ref_ingested_at,
      confidence: getMatchConfidence(matchScore),
      matchScore,
      fallback: false,
    },
    best,
  );
}

function mapFipexExpandedPrice(payload: FipexExpandedPayload): FipeExpandedPrice | null {
  const price = payload.data?.price;
  const amount = centsToPrice(price?.price);
  const modelYear = price?.model_year;
  if (!price || !amount || !modelYear) return null;

  const history = mapFipexHistory(payload.data?.history);
  const analytics = mapFipexAnalytics(payload.data?.analytics);
  const availableYears = (payload.data?.available_years ?? [])
    .map((item) => item.model_year)
    .filter((value): value is number => typeof value === "number")
    .sort((a, b) => a - b);

  const estimate: FipeEstimate = {
    provider: "FipeX",
    title: cleanFipeTitle(`${price.make?.name ?? ""} ${price.model?.name ?? ""}${price.fuel?.name ? ` ${price.fuel.name}` : ""}`),
    year: modelYear,
    price: amount,
    referenceMonth: formatReferenceMonth(price.reference?.month, price.reference?.year),
    referenceId: price.reference?.id,
    ingestedAt: price.query_date,
    confidence: "alta",
    matchScore: 100,
    fallback: false,
  };

  if (price.make?.id) estimate.makeId = price.make.id;
  if (price.make?.slug) estimate.makeSlug = price.make.slug;
  if (price.make?.name) estimate.makeName = price.make.name;
  if (price.model?.id) estimate.modelId = price.model.id;
  if (price.model?.slug) estimate.modelSlug = price.model.slug;
  if (price.model?.name) estimate.modelName = cleanFipeTitle(price.model.name);
  if (price.fuel?.id) estimate.fuelId = price.fuel.id;
  if (price.fuel?.acronym) estimate.fuelAcronym = price.fuel.acronym;
  if (price.fuel?.name) estimate.fuelName = price.fuel.name;
  if (price.type?.id) estimate.typeId = price.type.id;
  if (price.type?.name) estimate.typeName = price.type.name;
  if (analytics) estimate.analytics = analytics;
  if (history.length > 0) estimate.history = history;
  if (availableYears.length > 0) estimate.availableYears = availableYears;

  return {
    estimate,
    history,
    analytics,
    availableYears,
  };
}

function mapFipexHistory(history?: NonNullable<FipexExpandedPayload["data"]>["history"]): FipePriceHistoryPoint[] {
  return (history ?? [])
    .map((point) => {
      const price = centsToPrice(point.market_price_cents);
      if (!point.year || !point.month || !price) return null;

      return {
        year: point.year,
        month: point.month,
        price,
        referenceMonth: formatReferenceMonth(point.month, point.year),
        label: `${String(point.month).padStart(2, "0")}/${point.year}`,
      };
    })
    .filter((point): point is FipePriceHistoryPoint => point !== null)
    .sort((a, b) => a.year - b.year || a.month - b.month);
}

function mapFipexAnalytics(analytics?: NonNullable<FipexExpandedPayload["data"]>["analytics"]): FipeExpandedAnalytics | undefined {
  if (!analytics) return undefined;

  return {
    changeFromPreviousMonthPercent: analytics.change_from_previous_month_pct,
    changeFromLaunchPercent: analytics.change_from_launch_pct,
    peakToNowPercentChange: analytics.peak_to_now_pct_change,
    priceVolatility: analytics.price_volatility,
    priceRank: analytics.price_rank,
    priceRankTotalInCategory: analytics.price_rank_total_in_category,
    valueRetentionPercent: analytics.value_retention_pct,
    annualDepreciationRate: analytics.annual_depreciation_rate,
    lifecycleStatus: analytics.lifecycle_status,
    anomalyStatus: analytics.anomaly_status,
    anomalyZScore: analytics.anomaly_z_score,
  };
}

function withFipexSearchMeta<T extends FipeModelSuggestion | FipeEstimate>(target: T, item: FipexSearchItem): T {
  const fuelAcronym = getFipexFuelAcronym(item);

  if (item.price_id) target.priceId = item.price_id;
  if (item.model_id) target.modelId = item.model_id;
  if (item.model_slug) target.modelSlug = item.model_slug;
  if (item.make_id) target.makeId = item.make_id;
  if (item.make_slug) target.makeSlug = item.make_slug;
  if (item.fuel_id) target.fuelId = item.fuel_id;
  if (fuelAcronym) target.fuelAcronym = fuelAcronym;
  if (item.type_id) target.typeId = item.type_id;
  if (item.latest_ref_id) target.referenceId = item.latest_ref_id;
  if (item.ref_fipe_id) target.referenceCode = item.ref_fipe_id;
  if (typeof item.score === "number" && "matchScore" in target) target.matchScore = item.score;
  return target;
}

function scoreFipexItem(item: FipexSearchItem, queryTokens: string[], targetYear?: number): number {
  const normalizedName = normalizeSearchText(`${item.make_name ?? ""} ${item.model_name ?? ""}`);
  const tokenScore = queryTokens.reduce((score, token) => score + (normalizedName.includes(token) ? 2 : 0), 0);
  const yearScore =
    targetYear && item.model_year
      ? Math.max(0, 6 - Math.min(Math.abs(targetYear - item.model_year), 6))
      : 0;

  return tokenScore + yearScore;
}

function countFipexTokenMatches(item: FipexSearchItem, queryTokens: string[]): number {
  const normalizedName = normalizeSearchText(`${item.make_name ?? ""} ${item.model_name ?? ""}`);
  return queryTokens.filter((token) => normalizedName.includes(token)).length;
}

function isUsableFipexMatch({
  score,
  tokenMatches,
  queryTokenCount,
  yearDistance,
}: {
  score: number;
  tokenMatches: number;
  queryTokenCount: number;
  yearDistance: number | null;
}): boolean {
  const requiredTokenMatches = queryTokenCount === 1 ? 1 : 2;
  if (score <= 0 || tokenMatches < requiredTokenMatches) return false;
  if (yearDistance !== null && yearDistance > 2) return false;
  return true;
}

function buildQueryTokens(value: string): string[] {
  return normalizeSearchText(value)
    .split(" ")
    .filter(isUsefulVehicleToken);
}

function extractYearFromText(value: string): number | null {
  const match = value.match(/\b(19[0-9]{2}|20[0-9]{2})\b/);
  if (!match) return null;

  const year = Number(match[1]);
  const currentYear = new Date().getFullYear() + 1;
  return year >= 1900 && year <= currentYear ? year : null;
}

function isUsefulVehicleToken(token: string): boolean {
  if (/^\d{4}$/.test(token)) return false;
  return token.length >= 3 || /^[a-z]{1,2}\d{1,3}[a-z]?$/.test(token);
}

function getMatchConfidence(score: number): FipeEstimate["confidence"] {
  if (score >= 10) return "alta";
  if (score >= 5) return "media";
  return "baixa";
}

function formatReferenceMonth(month?: number, year?: number): string {
  if (!month || !year) return "referencia mais recente";
  return `${MONTHS[month - 1] ?? String(month)}/${year}`;
}

function centsToPrice(value?: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value / 100) : null;
}

function getFipexFuelAcronym(item: FipexSearchItem): string | undefined {
  return item.fuel_acronym ?? item.fuel_acroym;
}

function createFipexFetchInit(): RequestInit {
  const init: RequestInit = {
    headers: { accept: "application/json" },
    cache: "no-store",
  };
  const signal = createTimeoutSignal();
  if (signal) init.signal = signal;
  return init;
}

function createTimeoutSignal(): AbortSignal | undefined {
  if (typeof AbortSignal === "undefined") return undefined;
  const timeout = (AbortSignal as typeof AbortSignal & { timeout?: (ms: number) => AbortSignal }).timeout;
  return timeout ? timeout(FIPEX_REQUEST_TIMEOUT_MS) : undefined;
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanFipeTitle(value: string): string {
  return value
    .replace(/\bSed\./gi, "Sedan ")
    .replace(/\bAut\./gi, "Automatico ")
    .replace(/\bMec\./gi, "Manual ")
    .replace(/\bAutomatico(?=\d)/gi, "Automatico ")
    .replace(/\s+/g, " ")
    .trim();
}
