import { describe, expect, it } from "vitest";
import {
  buildPriceDecision,
  buildPriceGuidance,
  getPriceConditionOption,
  normalizeTargetMargin,
  priceConditionSelectOptions,
} from "./price-comparison";

describe("price comparison helpers", () => {
  it("calculates margin-based suggested price and purchase ceiling", () => {
    const decision = buildPriceDecision({
      fipePrice: 100000,
      purchasePrice: 85000,
      targetMargin: 15,
      conditionKey: "good",
    });

    expect(decision.suggestedByMargin).toBe(100000);
    expect(decision.suggestedPrice).toBe(100000);
    expect(decision.maxRecommendedPurchasePrice).toBe(85000);
    expect(decision.marginPercent).toBe(15);
  });

  it("keeps the purchase ceiling tied to FIPE instead of the margin-raised suggested price", () => {
    const decision = buildPriceDecision({
      fipePrice: 100000,
      purchasePrice: 95000,
      targetMargin: 12,
      conditionKey: "good",
    });
    const guidance = buildPriceGuidance(decision);

    expect(decision.suggestedByMargin).toBe(107955);
    expect(decision.suggestedPrice).toBe(107955);
    expect(decision.maxRecommendedPurchasePrice).toBe(88000);
    expect(decision.purchaseExceedsRecommendedPrice).toBe(true);
    expect(guidance.tone).toBe("danger");
    expect(guidance.title).toBe("Compra acima do teto recomendado");
  });

  it("applies vehicle condition factors to adjusted FIPE", () => {
    const excellent = buildPriceDecision({
      fipePrice: 100000,
      targetMargin: 12,
      conditionKey: "excellent",
    });
    const repair = buildPriceDecision({
      fipePrice: 100000,
      targetMargin: 12,
      conditionKey: "repair",
    });

    expect(excellent.adjustedFipe).toBe(103000);
    expect(repair.adjustedFipe).toBe(90000);
  });

  it("exposes a no-adjustment option for forms without changing the domain fallback", () => {
    expect(priceConditionSelectOptions[0].key).toBe("");
    expect(getPriceConditionOption("").optionLabel).toBe("Sem ajuste");
    expect(normalizeTargetMargin("")).toBe(12);
  });
});
