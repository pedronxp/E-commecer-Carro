import { describe, expect, it } from "vitest";

import { getFipexExpandedPrice, mapFipexSuggestions, selectBestFipexMatch } from "./fipe-provider";

describe("selectBestFipexMatch", () => {
  it("selects the closest car match by type, title, and year", () => {
    const result = selectBestFipexMatch(
      [
        {
          make_name: "Honda",
          model_name: "CG 160 Fan",
          model_year: 2024,
          type_name: "moto",
          latest_market_price_cents: 1750000,
          ref_month: 5,
          ref_year: 2026,
        },
        {
          make_name: "Honda",
          model_name: "Civic EXL",
          fuel_name: "Flex",
          model_year: 2024,
          type_name: "carro",
          latest_market_price_cents: 16590000,
          ref_month: 5,
          ref_year: 2026,
          ref_fipe_id: 333,
        },
      ],
      { title: "Honda Civic EXL 2024", year: 2024, vehicleType: "CAR" },
    );

    expect(result).toEqual({
      provider: "FipeX",
      title: "Honda Civic EXL Flex",
      year: 2024,
      price: 165900,
      referenceMonth: "maio/2026",
      referenceCode: 333,
      ingestedAt: undefined,
      confidence: "alta",
      matchScore: 12,
      fallback: false,
    });
  });

  it("does not return motorcycle data for car requests", () => {
    const result = selectBestFipexMatch(
      [
        {
          make_name: "Honda",
          model_name: "CG 160 Fan",
          model_year: 2024,
          type_name: "moto",
          latest_market_price_cents: 1750000,
          ref_month: 5,
          ref_year: 2026,
        },
      ],
      { title: "Honda CG 160", year: 2024, vehicleType: "CAR" },
    );

    expect(result).toBeNull();
  });

  it("rejects weak provider matches that only share a brand token", () => {
    const result = selectBestFipexMatch(
      [
        {
          make_name: "Honda",
          model_name: "Fit LX",
          model_year: 2019,
          type_name: "carro",
          latest_market_price_cents: 6800000,
          ref_month: 5,
          ref_year: 2026,
        },
      ],
      { title: "Honda City", year: 2015, vehicleType: "CAR" },
    );

    expect(result).toBeNull();
  });
});

describe("mapFipexSuggestions", () => {
  it("returns unique vehicle suggestions with price and reference", () => {
    const suggestions = mapFipexSuggestions(
      [
        {
          price_id: "price-1",
          model_id: "model-1",
          model_slug: "civic-exl",
          make_id: "make-1",
          make_name: "Honda",
          make_slug: "honda",
          fuel_id: "fuel-1",
          fuel_acroym: "g",
          model_name: "Civic EXL",
          model_year: 2020,
          type_id: "type-car",
          type_name: "carro",
          latest_market_price_cents: 11067000,
          latest_ref_id: "ref-1",
          ref_month: 5,
          ref_year: 2026,
          ref_fipe_id: "001267-0",
        },
        {
          make_name: "Honda",
          model_name: "Civic EXL",
          model_year: 2020,
          type_name: "carro",
          latest_market_price_cents: 11067000,
          ref_month: 5,
          ref_year: 2026,
        },
        {
          make_name: "Honda",
          model_name: "CG 160",
          model_year: 2020,
          type_name: "moto",
          latest_market_price_cents: 1500000,
          ref_month: 5,
          ref_year: 2026,
        },
      ],
      "CAR",
    );

    expect(suggestions).toEqual([
      {
        title: "Honda Civic EXL",
        makeName: "Honda",
        modelName: "Civic EXL",
        fuelName: undefined,
        year: 2020,
        price: 110670,
        referenceMonth: "maio/2026",
        provider: "FipeX",
        priceId: "price-1",
        modelId: "model-1",
        modelSlug: "civic-exl",
        makeId: "make-1",
        makeSlug: "honda",
        fuelId: "fuel-1",
        fuelAcronym: "g",
        typeId: "type-car",
        referenceId: "ref-1",
        referenceCode: "001267-0",
      },
    ]);
  });

  it("prioritizes the exact requested year for older vehicle searches", () => {
    const suggestions = mapFipexSuggestions(
      [
        {
          make_name: "Honda",
          model_name: "XRE 300 300 ABS FLEX",
          fuel_name: "Gasolina",
          model_year: 2010,
          type_name: "moto",
          latest_market_price_cents: 1525100,
          ref_month: 5,
          ref_year: 2026,
        },
        {
          make_name: "Honda",
          model_name: "XRE 300 Rally Flex",
          fuel_name: "Flex",
          model_year: 2023,
          type_name: "moto",
          latest_market_price_cents: 3024300,
          ref_month: 5,
          ref_year: 2026,
        },
      ],
      "MOTORCYCLE",
      { targetYear: 2010 },
    );

    expect(suggestions).toEqual([
      expect.objectContaining({
        title: "Honda XRE 300 300 ABS FLEX",
        year: 2010,
        price: 15251,
      }),
    ]);
  });
});

describe("getFipexExpandedPrice", () => {
  it("maps expanded price, analytics, history and available years", async () => {
    const fetcher = async (input: string | URL) => {
      expect(String(input)).toContain("/v1/prices/expanded");
      expect(String(input)).toContain("model_slug=civic-exl");
      expect(String(input)).toContain("fuel_acronym=g");
      expect(String(input)).toContain("year=2020");

      return new Response(
        JSON.stringify({
          data: {
            price: {
              price: 11067000,
              model_year: 2020,
              query_date: "2026-05-02T00:00:00Z",
              make: { id: "make-1", name: "Honda", slug: "honda" },
              model: { id: "model-1", name: "Civic EXL", slug: "civic-exl" },
              fuel: { id: "fuel-1", acronym: "g", name: "Gasolina" },
              type: { id: "type-car", name: "carro", slug: "C" },
              reference: { id: "ref-1", month: 5, year: 2026 },
            },
            analytics: {
              change_from_previous_month_pct: 1.2,
              value_retention_pct: 68,
              lifecycle_status: "used",
            },
            history: [
              { year: 2026, month: 4, market_price_cents: 10900000 },
              { year: 2026, month: 5, market_price_cents: 11067000 },
            ],
            available_years: [{ model_year: 2019 }, { model_year: 2020 }],
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    };

    const expanded = await getFipexExpandedPrice({
      modelSlug: "civic-exl",
      fuelAcronym: "g",
      year: 2020,
      fetcher,
    });

    expect(expanded?.estimate).toMatchObject({
      title: "Honda Civic EXL Gasolina",
      year: 2020,
      price: 110670,
      referenceMonth: "maio/2026",
      modelId: "model-1",
      fuelAcronym: "g",
      confidence: "alta",
    });
    expect(expanded?.history).toEqual([
      { year: 2026, month: 4, price: 109000, referenceMonth: "abril/2026", label: "04/2026" },
      { year: 2026, month: 5, price: 110670, referenceMonth: "maio/2026", label: "05/2026" },
    ]);
    expect(expanded?.analytics?.valueRetentionPercent).toBe(68);
    expect(expanded?.availableYears).toEqual([2019, 2020]);
  });
});
