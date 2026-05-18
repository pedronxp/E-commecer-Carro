import { describe, expect, it } from "vitest";
import { buildPriceTimeline, getTimelineVariation, normalizeTimelineRange } from "./price-timeline";

const suggestions = [
  { year: 2003, price: 14493, title: "Fiat Uno Mille Fire 2003", referenceMonth: "maio/2026" },
  { year: 2004, price: 15000, title: "Fiat Uno Mille Fire 2004", referenceMonth: "maio/2026" },
  { year: 2010, price: 24500, title: "Fiat Uno Mille Fire 2010", referenceMonth: "maio/2026" },
  { year: 2013, price: 28446, title: "Fiat Uno Mille Fire 2013", referenceMonth: "maio/2026" },
  { year: 2027, price: 40000, title: "Fiat Uno Mille Fire 2027", referenceMonth: "maio/2026" },
];

describe("buildPriceTimeline", () => {
  it("keeps only available FIPE years in automatic mode", () => {
    const points = buildPriceTimeline({
      compareTitle: "Fiat Uno Mille Fire",
      compareYear: 2003,
      timelineRange: "available",
      standaloneFipe: null,
      suggestions,
      currentYear: 2026,
    });

    expect(points.map((point) => point.year)).toEqual([2003, 2004, 2010, 2013]);
    expect(points.some((point) => point.year === 2027)).toBe(false);
  });

  it("limits selected mode to the selected model year window", () => {
    const points = buildPriceTimeline({
      compareTitle: "Fiat Uno Mille Fire",
      compareYear: 2010,
      timelineRange: "selected",
      standaloneFipe: null,
      suggestions,
      currentYear: 2026,
    });

    expect(points.map((point) => point.year)).toEqual([2003, 2004, 2010]);
    expect(points.at(-1)?.isSelected).toBe(true);
  });

  it("does not invent current-year points in expanded current mode", () => {
    const points = buildPriceTimeline({
      compareTitle: "Fiat Uno Mille Fire",
      compareYear: 2003,
      timelineRange: "current",
      standaloneFipe: null,
      suggestions,
      currentYear: 2026,
    });

    expect(points.map((point) => point.year)).toEqual([2003, 2004, 2010, 2013]);
    expect(points.some((point) => point.year === 2026)).toBe(false);
  });
});

describe("timeline helpers", () => {
  it("normalizes invalid range to automatic available mode", () => {
    expect(normalizeTimelineRange("current")).toBe("current");
    expect(normalizeTimelineRange("selected")).toBe("selected");
    expect(normalizeTimelineRange("invalid")).toBe("available");
    expect(normalizeTimelineRange()).toBe("available");
  });

  it("returns absolute and percent variation from visible points", () => {
    expect(getTimelineVariation([
      { year: 2003, price: 10000, title: "A", referenceMonth: "maio/2026", isSelected: true },
      { year: 2004, price: 12500, title: "A", referenceMonth: "maio/2026", isSelected: false },
    ])).toEqual({ absolute: 2500, percent: 25 });
  });
});
