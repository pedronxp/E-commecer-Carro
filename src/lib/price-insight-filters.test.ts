import { describe, expect, it } from "vitest";

import { buildPriceInsightSearchFilters, scoreLocalPriceCandidate } from "./price-insight-filters";

describe("buildPriceInsightSearchFilters", () => {
  it("keeps only useful title tokens and builds a bounded year window", () => {
    const filters = buildPriceInsightSearchFilters({
      title: "Honda Civic 2024 Flex Automatico",
      year: 2024,
      currentYear: 2026,
    });

    expect(filters.tokens).toEqual(["honda", "civic"]);
    expect(filters.targetYear).toBe(2024);
    expect(filters.yearWindow).toEqual({ min: 2022, max: 2026 });
    expect(filters.minimumTokenMatches).toBe(2);
  });

  it("keeps short alphanumeric model tokens such as X1", () => {
    const filters = buildPriceInsightSearchFilters({
      title: "BMW X1 2026",
      year: 2026,
      currentYear: 2026,
    });

    expect(filters.tokens).toEqual(["bmw", "x1"]);
  });
});

describe("scoreLocalPriceCandidate", () => {
  it("accepts candidates with model token match and nearby year", () => {
    const score = scoreLocalPriceCandidate({
      candidateTitle: "Honda Civic EXL",
      tokens: ["honda", "civic", "exl"],
      targetYear: 2024,
      vehicleYear: 2024,
      minimumTokenMatches: 2,
    });

    expect(score.accepted).toBe(true);
    expect(score.tokenMatches).toBe(3);
    expect(score.yearDistance).toBe(0);
  });

  it("rejects candidates that only match the brand", () => {
    const score = scoreLocalPriceCandidate({
      candidateTitle: "Honda Fit LX",
      tokens: ["honda", "city"],
      targetYear: 2019,
      vehicleYear: 2019,
      minimumTokenMatches: 2,
    });

    expect(score.accepted).toBe(false);
    expect(score.tokenMatches).toBe(1);
  });

  it("rejects candidates outside the model-year window", () => {
    const score = scoreLocalPriceCandidate({
      candidateTitle: "Fiat Uno Mille",
      tokens: ["fiat", "uno", "mille"],
      targetYear: 2010,
      vehicleYear: 2016,
      minimumTokenMatches: 2,
    });

    expect(score.accepted).toBe(false);
    expect(score.yearDistance).toBe(6);
  });
});
