export type FipeProviderVehicleType = "CAR" | "MOTORCYCLE";

type FipexSearchItem = {
  price_id?: string;
  model_name?: string;
  make_name?: string;
  fuel_name?: string;
  model_year?: number;
  latest_market_price_cents?: number;
  type_name?: string;
  ref_month?: number;
  ref_year?: number;
  ref_fipe_id?: number;
  ref_ingested_at?: string;
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
};

export type FipeEstimate = {
  provider: "FipeX";
  title: string;
  year: number;
  price: number;
  referenceMonth: string;
  referenceCode?: number;
  ingestedAt?: string;
  confidence: "alta" | "media" | "baixa";
  matchScore: number;
  fallback: false;
};

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

const FIPEX_BASE_URL = "https://api.fipex.com.br";
const FIPEX_TYPE_NAMES: Record<FipeProviderVehicleType, string> = {
  CAR: "carro",
  MOTORCYCLE: "moto",
};

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
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
  fetcher = fetch,
}: {
  title: string;
  year?: number;
  vehicleType: FipeProviderVehicleType;
  fetcher?: FetchLike;
}): Promise<FipeEstimate | null> {
  const query = normalizeSearchText(title);
  if (query.length < 3) return null;

  const url = new URL("/v1/search", FIPEX_BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "10");

  try {
    const response = await fetcher(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as { data?: FipexSearchItem[] };
    return selectBestFipexMatch(payload.data ?? [], {
      title,
      year,
      vehicleType,
    });
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

  const url = new URL("/v1/search", FIPEX_BASE_URL);
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("limit", includeOlderModels ? "60" : "20");
  url.searchParams.set("order_by", "-year");

  try {
    const response = await fetcher(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as { data?: FipexSearchItem[] };
    return mapFipexSuggestions(payload.data ?? [], vehicleType, {
      limit: includeOlderModels ? 20 : 8,
    });
  } catch {
    return [];
  }
}

export function mapFipexSuggestions(
  items: FipexSearchItem[],
  vehicleType: FipeProviderVehicleType,
  { limit = 8 }: { limit?: number } = {},
): FipeModelSuggestion[] {
  const expectedType = FIPEX_TYPE_NAMES[vehicleType];
  const seen = new Set<string>();

  return items
    .filter((item) => item.type_name === expectedType)
    .filter(
      (item) =>
        Boolean(item.make_name) &&
        Boolean(item.model_name) &&
        typeof item.model_year === "number" &&
        typeof item.latest_market_price_cents === "number" &&
        item.latest_market_price_cents > 0,
    )
    .map((item) => ({
      title: cleanFipeTitle(`${item.make_name} ${item.model_name}`),
      makeName: item.make_name as string,
      modelName: cleanFipeTitle(item.model_name as string),
      fuelName: item.fuel_name,
      year: item.model_year as number,
      price: Math.round((item.latest_market_price_cents as number) / 100),
      referenceMonth: formatReferenceMonth(item.ref_month, item.ref_year),
      provider: "FipeX" as const,
    }))
    .filter((suggestion) => {
      const key = `${suggestion.title}-${suggestion.year}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
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
  const queryTokens = normalizeSearchText(title)
    .split(" ")
    .filter((token) => token.length >= 3);

  const ranked = items
    .filter((item) => item.type_name === expectedType)
    .filter((item) => typeof item.latest_market_price_cents === "number" && item.latest_market_price_cents > 0)
    .map((item) => ({
      item,
      score: scoreFipexItem(item, queryTokens, year),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const bestRanked = ranked[0];
  const best = bestRanked?.item;
  if (!best?.model_name || !best.make_name || !best.model_year || !best.latest_market_price_cents) {
    return null;
  }

  const matchScore = bestRanked.score;

  return {
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
  };
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

function getMatchConfidence(score: number): FipeEstimate["confidence"] {
  if (score >= 10) return "alta";
  if (score >= 5) return "media";
  return "baixa";
}

function formatReferenceMonth(month?: number, year?: number): string {
  if (!month || !year) return "referência mais recente";
  return `${MONTHS[month - 1] ?? String(month)}/${year}`;
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
    .replace(/\bAut\./gi, "Automático ")
    .replace(/\bMec\./gi, "Manual ")
    .replace(/\bAutomático(?=\d)/gi, "Automático ")
    .replace(/\s+/g, " ")
    .trim();
}
