export type TimelineRange = "available" | "selected" | "current";

export type PriceTimelinePoint = {
  year: number;
  price: number;
  title: string;
  referenceMonth: string;
  isSelected: boolean;
};

type TimelineSuggestion = {
  year: number;
  price: number;
  title: string;
  referenceMonth: string;
};

export function buildPriceTimeline({
  compareTitle,
  compareYear,
  timelineRange,
  standaloneFipe,
  suggestions,
  currentYear = new Date().getFullYear(),
}: {
  compareTitle: string;
  compareYear?: number;
  timelineRange: TimelineRange;
  standaloneFipe: TimelineSuggestion | null;
  suggestions: TimelineSuggestion[];
  currentYear?: number;
}): PriceTimelinePoint[] {
  if (!compareTitle) return [];

  const tokens = normalizeComparisonText(compareTitle)
    .split(" ")
    .filter((token) => token.length >= 3 && !/^\d{4}$/.test(token));
  const scored = suggestions
    .map((suggestion) => ({
      suggestion,
      score: scoreSuggestion(suggestion.title, tokens),
    }))
    .filter(({ score }) => score >= Math.min(2, Math.max(tokens.length, 1)))
    .map(({ suggestion }) => ({
      year: suggestion.year,
      price: suggestion.price,
      title: suggestion.title,
      referenceMonth: suggestion.referenceMonth,
      isSelected: compareYear === suggestion.year || standaloneFipe?.year === suggestion.year,
    }));

  const points = [...scored];
  if (standaloneFipe && !points.some((point) => point.year === standaloneFipe.year)) {
    points.push({
      year: standaloneFipe.year,
      price: standaloneFipe.price,
      title: standaloneFipe.title,
      referenceMonth: standaloneFipe.referenceMonth,
      isSelected: true,
    });
  }

  const selectedYear = compareYear ?? standaloneFipe?.year;
  const availablePoints = points.filter((point) => point.year <= currentYear);
  if (availablePoints.length === 0) return [];

  const minAvailableYear = availablePoints.reduce((min, point) => Math.min(min, point.year), availablePoints[0].year);
  const maxAvailableYear = availablePoints.reduce((max, point) => Math.max(max, point.year), availablePoints[0].year);
  let startYear = minAvailableYear;
  let endYear = maxAvailableYear;

  if (timelineRange === "current") {
    startYear = selectedYear ? Math.min(Math.max(selectedYear, minAvailableYear), maxAvailableYear) : minAvailableYear;
    endYear = currentYear;
  } else if (timelineRange === "selected") {
    endYear = selectedYear ? Math.min(Math.max(selectedYear, minAvailableYear), maxAvailableYear) : maxAvailableYear;
    startYear = Math.max(minAvailableYear, endYear - 9);
  } else {
    startYear = selectedYear ? Math.min(Math.max(selectedYear, minAvailableYear), maxAvailableYear) : Math.max(minAvailableYear, maxAvailableYear - 9);
    endYear = maxAvailableYear;
  }

  const uniqueByYear = new Map<number, PriceTimelinePoint>();

  availablePoints
    .filter((point) => point.year >= startYear && point.year <= endYear)
    .sort((a, b) => b.price - a.price)
    .forEach((point) => {
      const current = uniqueByYear.get(point.year);
      if (!current || point.isSelected || point.price > current.price) {
        uniqueByYear.set(point.year, point);
      }
    });

  const sorted = Array.from(uniqueByYear.values()).sort((a, b) => a.year - b.year);
  const visible = timelineRange === "selected" ? sorted.slice(-10) : sorted;

  return visible.map((point) => ({
    ...point,
    isSelected: Boolean(selectedYear && point.year === selectedYear),
  }));
}

export function getTimelineVariation(points: PriceTimelinePoint[]): { absolute: number; percent: number } | null {
  if (points.length < 2) return null;

  const prices = points.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min <= 0 || max <= min) return null;

  return {
    absolute: max - min,
    percent: Math.round(((max - min) / min) * 100),
  };
}

export function normalizeTimelineRange(value?: string): TimelineRange {
  if (value === "selected" || value === "current") return value;
  return "available";
}

function scoreSuggestion(title: string, tokens: string[]): number {
  const normalizedTitle = normalizeComparisonText(title);
  return tokens.reduce((score, token) => score + (normalizedTitle.includes(token) ? 1 : 0), 0);
}

function normalizeComparisonText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
