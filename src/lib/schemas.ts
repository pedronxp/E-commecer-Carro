import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const carSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(5),
  price: z.coerce.number().positive(),
  year: z.coerce.number().int().min(1900).max(2100),
  mileage: z.coerce.number().int().nonnegative().nullable().optional(),
  fuelType: z.string().trim().max(60).nullable().optional(),
  transmission: z.string().trim().max(60).nullable().optional(),
  color: z.string().trim().max(60).nullable().optional(),
  doors: z.coerce.number().int().min(1).max(10).nullable().optional(),
  capacity: z.coerce.number().int().min(1).max(20).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(80)).optional(),
  isSold: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).optional(),
});

export const carToggleSchema = z.object({
  carId: z.string().min(1),
});

export const sellLeadIntentEnum = z.enum(["DIRECT_SALE", "CONSIGNMENT", "EVALUATE_BOTH"]);

export type SellLeadIntentType = z.infer<typeof sellLeadIntentEnum>;

export const sellLeadIntentLabels: Record<SellLeadIntentType, string> = {
  DIRECT_SALE: "Venda direta",
  CONSIGNMENT: "Consignação",
  EVALUATE_BOTH: "Quero avaliar as duas",
};

/** Transform empty string to undefined so optional fields remain absent. */
function blankToOptional(val: unknown) {
  return val === "" ? undefined : val;
}

export const sellLeadSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome completo.").max(120),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().trim().max(30).optional().default(""),
  vehicleModel: z.string().trim().min(2, "Informe o modelo do veículo.").max(200),
  year: z.preprocess(
    blankToOptional,
    z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  ),
  mileage: z.preprocess(
    blankToOptional,
    z.coerce.number().int().nonnegative().max(9_999_999).optional().nullable(),
  ),
  intent: sellLeadIntentEnum,
  notes: z.string().trim().max(2000).optional().default(""),
  consent: z.literal(true, {
    message: "É necessário autorizar o tratamento de dados conforme a LGPD.",
  }),
});

export type SellLeadInput = z.infer<typeof sellLeadSchema>;

export function parseSellLeadInput(data: unknown) {
  return sellLeadSchema.safeParse(data);
}
