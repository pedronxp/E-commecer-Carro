const MIN_VEHICLE_YEAR = 1900;
const YEAR_WINDOW = 2;
const SEARCH_STOPWORDS = new Set([
  "automatico",
  "manual",
  "automatica",
  "mecanico",
  "mecanica",
  "flex",
  "gasolina",
  "alcool",
  "diesel",
  "eletrico",
  "hibrido",
  "edicao",
  "serie",
  "versao",
  "com",
  "sem",
]);

export type PriceInsightSearchFilters = {
  tokens: string[];
  targetYear: number | null;
  yearWindow: { min: number; max: number } | null;
  minimumTokenMatches: number;
};

export type LocalPriceCandidateScore = {
  accepted: boolean;
  score: number;
  tokenMatches: number;
  requiredTokenMatches: number;
  yearDistance: number | null;
};

export function buildPriceInsightSearchFilters({
  title,
  year,
  currentYear = new Date().getFullYear(),
}: {
  title: string;
  year: number;
  currentYear?: number;
}): PriceInsightSearchFilters {
  const tokens = normalizeSearchText(title)
    .split(" ")
    .filter(isUsefulVehicleToken)
    .filter((token) => !SEARCH_STOPWORDS.has(token))
    .slice(0, 6);
  const targetYear =
    Number.isFinite(year) && year >= MIN_VEHICLE_YEAR && year <= currentYear + 1
      ? Math.trunc(year)
      : null;

  return {
    tokens,
    targetYear,
    yearWindow: targetYear
      ? {
          min: Math.max(MIN_VEHICLE_YEAR, targetYear - YEAR_WINDOW),
          max: Math.min(currentYear + 1, targetYear + YEAR_WINDOW),
        }
      : null,
    minimumTokenMatches: getMinimumTokenMatches(tokens.length),
  };
}

export function scoreLocalPriceCandidate({
  candidateTitle,
  tokens,
  targetYear,
  vehicleYear,
  minimumTokenMatches,
}: {
  candidateTitle: string;
  tokens: string[];
  targetYear: number | null;
  vehicleYear: number;
  minimumTokenMatches: number;
}): LocalPriceCandidateScore {
  const normalizedTitle = normalizeSearchText(candidateTitle);
  const tokenMatches = tokens.filter((token) => normalizedTitle.includes(token)).length;
  const yearDistance = targetYear && Number.isFinite(vehicleYear) ? Math.abs(targetYear - vehicleYear) : null;
  const tokenRatio = tokens.length > 0 ? tokenMatches / tokens.length : 0;
  const yearScore = yearDistance === null ? 0 : Math.max(0, 8 - yearDistance * 3);
  const score = Math.round(tokenMatches * 4 + tokenRatio * 4 + yearScore);
  const accepted = tokenMatches >= minimumTokenMatches && (yearDistance === null || yearDistance <= YEAR_WINDOW);

  return {
    accepted,
    score,
    tokenMatches,
    requiredTokenMatches: minimumTokenMatches,
    yearDistance,
  };
}

export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMinimumTokenMatches(tokenCount: number): number {
  if (tokenCount <= 0) return 0;
  return tokenCount === 1 ? 1 : 2;
}

function isUsefulVehicleToken(token: string): boolean {
  if (/^\d{4}$/.test(token)) return false;
  return token.length >= 3 || /^[a-z]{1,2}\d{1,3}[a-z]?$/.test(token);
}
