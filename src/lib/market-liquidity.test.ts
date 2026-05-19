import { describe, expect, it } from "vitest";
import { buildMarketLiquidityInsight } from "./market-liquidity";

describe("market liquidity insight", () => {
  it("keeps regional liquidity separate from national FIPE pricing", () => {
    const insight = buildMarketLiquidityInsight({
      marketUf: "SP",
      vehicleType: "CAR",
      referencePrice: 100000,
      adjustedFipe: 100000,
      suggestedPrice: 103000,
      purchasePrice: 84000,
      maxRecommendedPurchasePrice: 88000,
      targetMargin: 12,
      trendTone: "default",
      fipeSpreadPercent: 4,
      localSampleCount: 3,
    });

    expect(insight.bestPurchasePrice).toBeLessThan(88000);
    expect(insight.maxRiskPurchasePrice).toBe(88000);
    expect(insight.resaleLikelihoodPercent).toBeGreaterThan(50);
    expect(insight.calculation.components).toHaveLength(5);
    expect(insight.calculation.formula).toContain("UF e mercado 30%");
    expect(insight.sources.some((source) => source.label.includes("FIPE"))).toBe(true);
  });

  it("penalizes purchase price above the recommended ceiling", () => {
    const insight = buildMarketLiquidityInsight({
      marketUf: "AC",
      vehicleType: "MOTORCYCLE",
      referencePrice: 50000,
      adjustedFipe: 47500,
      suggestedPrice: 59000,
      purchasePrice: 50000,
      maxRecommendedPurchasePrice: 41800,
      targetMargin: 12,
      trendTone: "danger",
      fipeSpreadPercent: 18,
      localSampleCount: 0,
    });

    expect(insight.tone).toBe("danger");
    expect(insight.purchaseDeltaToBest).toBeLessThan(0);
    expect(insight.confidence).not.toBe("alta");
  });

  it("does not derive purchase ceiling from suggested listing price alone", () => {
    const insight = buildMarketLiquidityInsight({
      marketUf: "SP",
      vehicleType: "CAR",
      suggestedPrice: 113636,
      purchasePrice: 100000,
      targetMargin: 12,
      localSampleCount: 0,
    });

    expect(insight.bestPurchasePrice).toBeNull();
    expect(insight.competitivePurchasePrice).toBeNull();
    expect(insight.maxRiskPurchasePrice).toBeNull();
    expect(insight.purchaseDeltaToBest).toBeNull();
    expect(insight.confidence).not.toBe("alta");
  });
});
