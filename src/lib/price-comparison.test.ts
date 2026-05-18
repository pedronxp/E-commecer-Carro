import { describe, expect, it } from "vitest";
import { buildPriceDecision, buildPriceGuidance, normalizePriceCondition, normalizeTargetMargin, parseMoneyText } from "./price-comparison";

describe("buildPriceDecision", () => {
  it("combines FIPE, condition, purchase cost, and target margin into one decision", () => {
    const decision = buildPriceDecision({
      fipePrice: 100000,
      purchasePrice: 88000,
      targetMargin: 12,
      conditionKey: "good",
    });

    expect(decision.adjustedFipe).toBe(100000);
    expect(decision.suggestedByFipe).toBe(100000);
    expect(decision.suggestedByMargin).toBe(100000);
    expect(decision.suggestedPrice).toBe(100000);
    expect(decision.grossMargin).toBe(12000);
    expect(decision.marginPercent).toBe(12);
    expect(decision.basis).toEqual(["fipe", "margin"]);
  });

  it("uses the current price as a fallback when FIPE and purchase cost are absent", () => {
    const decision = buildPriceDecision({
      currentPrice: 76500,
      conditionKey: "repair",
    });

    expect(decision.suggestedPrice).toBe(76500);
    expect(decision.grossMargin).toBeNull();
    expect(decision.marginPercent).toBeNull();
    expect(decision.basis).toEqual(["current-price"]);
  });

  it("does not let current FIPE override the margin and condition decision", () => {
    const decision = buildPriceDecision({
      fipePrice: 100000,
      purchasePrice: 80000,
      currentPrice: 130000,
      targetMargin: 12,
      conditionKey: "good",
    });

    expect(decision.suggestedByCurrentPrice).toBe(130000);
    expect(decision.suggestedPrice).toBe(100000);
    expect(decision.basis).toEqual(["fipe", "margin"]);
  });

  it("returns guidance for incomplete and consistent decisions", () => {
    const partial = buildPriceGuidance(buildPriceDecision({ currentPrice: 76500 }));
    expect(partial.tone).toBe("warning");
    expect(partial.suggestions).toContain("Informe o valor que pretende pagar para calcular lucro bruto e margem real.");

    const consistent = buildPriceGuidance(
      buildPriceDecision({
        fipePrice: 100000,
        purchasePrice: 88000,
        targetMargin: 12,
      }),
    );
    expect(consistent.tone).toBe("success");
    expect(consistent.title).toBe("Decisão consistente");
  });

  it("normalizes free text inputs used by the API and page filters", () => {
    expect(normalizePriceCondition("repair")).toBe("repair");
    expect(normalizePriceCondition("invalid")).toBe("good");
    expect(normalizeTargetMargin("15")).toBe(15);
    expect(normalizeTargetMargin("")).toBe(12);
    expect(normalizeTargetMargin("120")).toBe(12);
    expect(parseMoneyText("R$ 95.000,50")).toBe(95000.5);
    expect(parseMoneyText("95000.50")).toBe(95000.5);
  });
});
