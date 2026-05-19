import { describe, expect, it } from "vitest";
import {
  buildMarketContext,
  normalizeMarketUf,
  normalizeRecommendationReportMode,
} from "./pricing-report";

describe("pricing report helpers", () => {
  it("normalizes UF and report mode inputs", () => {
    expect(normalizeMarketUf("sp")).toBe("SP");
    expect(normalizeMarketUf("xx")).toBe("");
    expect(normalizeRecommendationReportMode("advanced")).toBe("advanced");
    expect(normalizeRecommendationReportMode("unknown")).toBe("basic");
  });

  it("keeps UF as market context without claiming regional FIPE pricing", () => {
    const context = buildMarketContext("MG");

    expect(context.requestedUf).toBe("MG");
    expect(context.pricingScope).toBe("national");
    expect(context.regionalPricingAvailable).toBe(false);
    expect(context.regionalProviderStatus).toBe("not-supported");
    expect(context.regionalPriceSource).toBeNull();
  });
});
