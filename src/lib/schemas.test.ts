import { describe, expect, it } from "vitest";
import { normalizeNameKey, parseCommercialEventInput, parseSellLeadInput, slugifyName } from "./schemas";

describe("parseSellLeadInput", () => {
  const valid = {
    name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 99999-9999",
    vehicleModel: "Sedan 2.0 automático",
    year: "2020",
    mileage: "50000",
    intent: "DIRECT_SALE",
    notes: "Carro em bom estado",
    consent: true,
  };

  it("accepts valid DIRECT_SALE input", () => {
    const result = parseSellLeadInput(valid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe("João Silva");
    expect(result.data.intent).toBe("DIRECT_SALE");
    expect(result.data.consent).toBe(true);
  });

  it("accepts CONSIGNMENT intent", () => {
    const result = parseSellLeadInput({ ...valid, intent: "CONSIGNMENT" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.intent).toBe("CONSIGNMENT");
  });

  it("accepts EVALUATE_BOTH intent", () => {
    const result = parseSellLeadInput({ ...valid, intent: "EVALUATE_BOTH" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.intent).toBe("EVALUATE_BOTH");
  });

  it("accepts purchase, financing, and contact intents with attribution fields", () => {
    for (const intent of ["PURCHASE", "FINANCING_INTEREST", "CONTACT_REQUEST"]) {
      const result = parseSellLeadInput({
        ...valid,
        intent,
        contactChannel: "WHATSAPP",
        sourcePath: "/carros/honda-civic",
        sourceType: "vehicle_detail",
        vehicleSlug: "honda-civic",
        carId: "car_123",
      });

      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.intent).toBe(intent);
      expect(result.data.contactChannel).toBe("WHATSAPP");
      expect(result.data.sourcePath).toBe("/carros/honda-civic");
    }
  });

  it("rejects invalid intent", () => {
    const result = parseSellLeadInput({ ...valid, intent: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = parseSellLeadInput({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = parseSellLeadInput({ ...valid, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = parseSellLeadInput({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects missing consent", () => {
    const result = parseSellLeadInput({ ...valid, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects consent as non-boolean", () => {
    const result = parseSellLeadInput({ ...valid, consent: "maybe" });
    expect(result.success).toBe(false);
  });

  it("coerces year from string to number", () => {
    const result = parseSellLeadInput({ ...valid, year: "2021" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.year).toBe(2021);
  });

  it("coerces mileage from string to number", () => {
    const result = parseSellLeadInput({ ...valid, mileage: "30000" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.mileage).toBe(30000);
  });

  it("accepts optional phone omitted", () => {
    const result = parseSellLeadInput({
      name: valid.name,
      email: valid.email,
      vehicleModel: valid.vehicleModel,
      year: valid.year,
      mileage: valid.mileage,
      intent: valid.intent,
      consent: valid.consent,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.phone).toBe("");
  });

  it("accepts optional notes omitted", () => {
    const result = parseSellLeadInput({
      name: valid.name,
      email: valid.email,
      phone: valid.phone,
      vehicleModel: valid.vehicleModel,
      year: valid.year,
      mileage: valid.mileage,
      intent: valid.intent,
      consent: valid.consent,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.notes).toBe("");
  });

  it("rejects vehicleModel too short", () => {
    const result = parseSellLeadInput({ ...valid, vehicleModel: "X" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = parseSellLeadInput({ ...valid, name: "  João Silva  " });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.name).toBe("João Silva");
  });

  it("accepts blank year as absent", () => {
    const result = parseSellLeadInput({ ...valid, year: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.year).toBeUndefined();
  });

  it("accepts blank mileage as absent", () => {
    const result = parseSellLeadInput({ ...valid, mileage: "" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.mileage).toBeUndefined();
  });

  it("rejects non-numeric year text", () => {
    const result = parseSellLeadInput({ ...valid, year: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects year below minimum", () => {
    const result = parseSellLeadInput({ ...valid, year: "1899" });
    expect(result.success).toBe(false);
  });

  it("rejects negative mileage", () => {
    const result = parseSellLeadInput({ ...valid, mileage: "-1" });
    expect(result.success).toBe(false);
  });

  it("rejects mileage above maximum", () => {
    const result = parseSellLeadInput({ ...valid, mileage: "10000000" });
    expect(result.success).toBe(false);
  });

  it("rejects non-numeric mileage text", () => {
    const result = parseSellLeadInput({ ...valid, mileage: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("parseCommercialEventInput", () => {
  const valid = {
    type: "WHATSAPP_CLICK",
    channel: "WHATSAPP",
    sourcePath: "/carros/honda-civic",
    ctaLabel: "Comprar pelo WhatsApp",
    vehicleSlug: "honda-civic",
    vehicleTitle: "Honda Civic EXL 2024",
    metadata: {
      price: 165900,
      featured: true,
      campaign: "vehicle-detail",
      empty: null,
    },
  };

  it("accepts a valid commercial event with safe metadata", () => {
    const result = parseCommercialEventInput(valid);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.type).toBe("WHATSAPP_CLICK");
    expect(result.data.channel).toBe("WHATSAPP");
    expect(result.data.metadata?.price).toBe(165900);
  });

  it("defaults missing channel to UNDEFINED", () => {
    const result = parseCommercialEventInput({
      type: "VEHICLE_VIEW",
      sourcePath: "/carros/honda-civic",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.channel).toBe("UNDEFINED");
  });

  it("rejects invalid event types", () => {
    const result = parseCommercialEventInput({ ...valid, type: "ADD_TO_CART" });
    expect(result.success).toBe(false);
  });

  it("rejects unsafe nested metadata", () => {
    const result = parseCommercialEventInput({
      ...valid,
      metadata: { nested: { phone: "11999999999" } },
    });
    expect(result.success).toBe(false);
  });

  it("rejects date objects in metadata instead of serializing them implicitly", () => {
    const result = parseCommercialEventInput({
      ...valid,
      metadata: { clickedAt: new Date("2026-05-17T12:00:00Z") },
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many metadata keys", () => {
    const metadata = Object.fromEntries(Array.from({ length: 13 }, (_, index) => [`key${index}`, index]));
    const result = parseCommercialEventInput({ ...valid, metadata });
    expect(result.success).toBe(false);
  });
});

describe("taxonomy normalization", () => {
  it("normalizes accents, punctuation, and repeated spacing for duplicate checks", () => {
    expect(normalizeNameKey("  Honda Automóveis!!  ")).toBe("honda automoveis");
    expect(normalizeNameKey("Bike   Elétrica")).toBe("bike eletrica");
  });

  it("creates stable lowercase slugs from brand and category names", () => {
    expect(slugifyName("Mercedes-Benz")).toBe("mercedes-benz");
    expect(slugifyName("Bike Elétrica")).toBe("bike-eletrica");
  });
});
