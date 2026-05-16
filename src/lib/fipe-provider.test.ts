import { describe, expect, it } from "vitest";

import { mapFipexSuggestions, selectBestFipexMatch } from "./fipe-provider";

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
});

describe("mapFipexSuggestions", () => {
  it("returns unique vehicle suggestions with price and reference", () => {
    const suggestions = mapFipexSuggestions(
      [
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
      },
    ]);
  });
});
